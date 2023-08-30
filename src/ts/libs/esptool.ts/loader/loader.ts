import type { SerialConn } from '../../serial/serial';
import * as SLIP from './slip';
import { sleep } from '../../../helper/time';
import {
  Command,
  Register,
  type Response,
  chips,
  Status,
  Chip,
  FlashSizeHandler,
  flash_sizes,
  type FlashSizeDescription,
  FlashEndFlag,
  type FlashImageOptions,
} from './types';
import { ErrorCode, ESPFlashError } from './error';
import { ESP32_stub } from './stubs';
import EventEmitter from '../../event_emitter';
import { bootloader_reset, hard_reset } from './reset';

const ROM_BAUDRATE = 115200;
const default_timeout = 3000;
const CHIP_ERASE_TIMEOUT = 120000; // timeout for full chip erase
const MD5_TIMEOUT_PER_MB = 8000; // timeout (per megabyte) for calculating md5sum
const ERASE_REGION_TIMEOUT_PER_MB = 30000; // timeout (per megabyte) for erasing a region in ms

enum SPICommand {
  SPIFLASH_RDID = 0x9f,
}

const sync_packet = [
  0x07, 0x07, 0x12, 0x20, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
  0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
  0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
];

const UART_CLKDIV_MASK = 0xfffff;

const OHAI = [0xc0, 0x4f, 0x48, 0x41, 0x49, 0xc0];
function is_ohai_packet(data: number[]): boolean {
  return data.length === OHAI.length && OHAI.every((d, i) => d === data[i]);
}

const ESP_RAM_BLOCK = 0x1800;

const FLASH_WRITE_SIZE = 0x400;
const STUBLOADER_FLASH_WRITE_SIZE = 0x4000;
const FLASH_SECTOR_SIZE = 0x100;

interface ESPLoaderEvents {
  open: ESPLoader;
  close: ESPLoader;
  bootloader: ESPLoader;
  sync: ESPLoader;
  stub: ESPLoader;
  error: Error;
  disconnect: ESPLoader;
}

export class ESPLoader extends EventEmitter<ESPLoaderEvents> {
  private readonly _serial: SerialConn;
  private _callback?: (data: Uint8Array) => void;

  private _is_stub: boolean = false;
  private _baudrate: number = ROM_BAUDRATE;

  private _chip?: Chip;
  private _efuses?: Uint32Array;

  private _flash_size: FlashSizeHandler = FlashSizeHandler.FS4MB;

  constructor(device: SerialConn) {
    super();

    this._serial = device;

    this._serial.on('data', data => {
      if (this._callback !== undefined) this._callback(data);
    });
  }

  get is_stub(): boolean {
    return this._is_stub;
  }

  private async serial_read(): Promise<void> {
    this._serial.read().catch(e => {
      this.emit('error', e);
    });
  }

  async open(baud: number): Promise<void> {
    this._serial.on('open', () => {
      this.emit('open', this);
      this.serial_read().finally(() => {});
    });
    this._serial.on('close', () => {
      this.emit('close', this);
    });
    this._serial.on('disconnect', () => {
      this.emit('disconnect', this);
    });

    this._baudrate = baud;
    await this._serial.open({
      baudRate: baud,
    });
  }

  async close(): Promise<void> {
    await this._serial.close();
    this._serial.clear_events();
  }

  async try_connect(): Promise<boolean> {
    const cb = this.callback;
    this.callback = undefined;
    for (let i = 0; i < 10; ++i) {
      try {
        await sleep(100);
        await this.signal_bootloader();
        const was_silent = await this.wait_silent(10, 1000);
        if (!was_silent) continue;
        this.emit('bootloader', this);
        await this.sync();
        this.callback = cb;
        return true;
      } catch (e) {
        console.log(
          `[${i.toString().padStart(2, '0')}] ${(e as ESPFlashError).message}`
        );
      }
    }
    this.callback = cb;
    return false;
  }

  async chip(): Promise<Chip> {
    if (this._chip === undefined) this._chip = await this.read_chip();
    return this._chip;
  }

  async efuses(): Promise<Uint32Array> {
    if (this._efuses === undefined) this._efuses = await this.read_efuses();
    return this._efuses;
  }

  get flash_size(): FlashSizeDescription {
    return flash_sizes[this._flash_size];
  }

  async mac(): Promise<number[]> {
    const chip = await this.chip();
    if (chip === undefined || chips[chip] === undefined)
      throw new ESPFlashError(ErrorCode.CHIP_NOT_DEFINED);
    const efuses = await this.efuses();
    if (efuses === undefined)
      throw new ESPFlashError(ErrorCode.EFUSES_NOT_DEFINED);
    return chips[chip].efuses_to_mac(Array.from(efuses)) as number[];
  }

  async change_baudrate(baud: number): Promise<void> {
    const resp = await this.command(
      Command.CHANGE_BAUDRATE,
      SLIP.pack32(baud, this._is_stub ? this._baudrate : 0),
      0
    );
    if (resp instanceof ESPFlashError) throw resp;
    this._baudrate = baud;
    await this._serial.change_config({ baudRate: baud });
    this.serial_read().finally(() => {});
  }

  async crystal_frequency(): Promise<number> {
    const uart_div =
      (await this.read_register(Register.UART_CLKDIV_REG)).value &
      UART_CLKDIV_MASK;
    const ets_xtal = (this._baudrate * uart_div) / 1000000 / 1;
    let norm_xtal;
    if (ets_xtal > 33) {
      norm_xtal = 40;
    } else {
      norm_xtal = 26;
    }
    if (Math.abs(norm_xtal - ets_xtal) > 1)
      console.warn('WARNING: Unsupported crystal in use');

    return norm_xtal;
  }

  /**
   * https://github.com/espressif/esptool/blob/da31d9d7a1bb496995f8e30a6be259689948e43e/esptool.py#L488C5-L491C65
   */
  async flash_id(): Promise<number> {
    const resp = await this.command_spiflash(SPICommand.SPIFLASH_RDID, [], 24);
    const handler = (resp.value >> 16) & 0xff;
    if (handler in FlashSizeHandler) this._flash_size = handler;
    return resp.value;
  }

  async erase_flash(timeout: number = CHIP_ERASE_TIMEOUT): Promise<void> {
    if (!this._is_stub) {
      throw new ESPFlashError(ErrorCode.STUB_ONLY_COMMAND);
    }
    await this.command(Command.ERASE_FLASH, [], 0, timeout);
  }

  async signal_reset(): Promise<void> {
    await hard_reset(this._serial);
    this.emit('open', this);
  }

  /**
   * https://github.com/espressif/esptool/blob/da31d9d7a1bb496995f8e30a6be259689948e43e/esptool.py#L829
   */
  async soft_reset(): Promise<void> {
    if (!this._is_stub) {
      await this.flash_begin(0, 0);
      await this.flash_end(FlashEndFlag.RUN_USER_CODE);
    } else if ((await this.chip()) !== Chip.ESP8266)
      throw new ESPFlashError(
        ErrorCode.NOT_SUPPORTED,
        'Soft resetting is currently only supported on ESP8266'
      );
    else await this.command(Command.RUN_USER_CODE, [], 0, 0);
  }

  get callback(): ((data: Uint8Array) => void) | undefined {
    return this._callback;
  }

  set callback(cb: ((data: Uint8Array) => void) | undefined) {
    this._callback = cb;
  }

  async signal_bootloader(): Promise<void> {
    await bootloader_reset(this._serial);
  }

  async sync(retries = 5): Promise<void> {
    for (let i = 0; i < retries; ++i) {
      try {
        await this.command(Command.SYNC, sync_packet, 0, 100);
        this.emit('sync', this);
        await this.spi_attach();
        return;
      } catch (e) {}
    }
    throw new ESPFlashError(ErrorCode.SYNC_ERROR);
  }

  async upload_stub(): Promise<void> {
    if (this._is_stub) throw new ESPFlashError(ErrorCode.STUB_ALREADY_UPLOAD);

    await this.write_mem(ESP32_stub.text, ESP32_stub.text_start);
    await this.write_mem(ESP32_stub.data, ESP32_stub.data_start);

    // await this.mem_end(FlashEndFlag.REBOOT, ESP32_stub.entry, 50);
    await this.mem_end(ESP32_stub.entry, 0);

    /**
     * As we don`t want to miss the OHAI packet, we are going to ignore
     * the mem_end command return and just look for the OHAI packet
     */
    let remain: number[] = [];
    if (
      !(await this.read_timeout_until(500, (data: Uint8Array): boolean => {
        const splited = SLIP.split(data, remain);
        remain = splited.remain;
        return splited.packets.some(packet => {
          if (is_ohai_packet(packet)) {
            this._is_stub = true;
            this.emit('stub', this);
            return true;
          }
          return false;
        });
      }))
    )
      throw new ESPFlashError(ErrorCode.UPLOAD_STUB_FAILED);
  }

  async flash_image(
    image: Uint8Array,
    offset: number,
    options?: FlashImageOptions
  ): Promise<void> {
    await this.flash_image_internal(image, image.byteLength, offset, options);
  }

  async flash_image_deflate(
    image: Uint8Array,
    original_size: number,
    offset: number,
    options?: FlashImageOptions
  ): Promise<void> {
    await this.flash_image_internal(image, original_size, offset, options);
  }

  /**
   * https://github.com/espressif/esptool/blob/da31d9d7a1bb496995f8e30a6be259689948e43e/esptool.py#L569
   * Not working at ROM loader
   */
  async flash_md5_calc(offset: number, size: number): Promise<string> {
    const timeout = ESPLoader.timeout_per_mb(MD5_TIMEOUT_PER_MB, size);
    const packet = await this.command(
      Command.SPI_FLASH_MD5,
      SLIP.pack32(offset, size, 0, 0),
      0,
      timeout < default_timeout ? timeout : default_timeout
    );

    if (this._is_stub)
      return packet.data
        .reduce<string[]>((acc, d) => {
          acc.push(d.toString(16).padStart(2, '0'));
          return acc;
        }, [])
        .join('');
    return String.fromCharCode(...packet.data);
  }

  /**
   * Private
   */
  /**
   * if image.byteLength === size uses normal flash, otherwise use deflate
   */
  private async flash_image_internal(
    image: Uint8Array,
    size: number,
    offset: number,
    options: FlashImageOptions = {}
  ): Promise<void> {
    const is_deflate = size !== image.byteLength;
    const file_size = image.byteLength;
    const blocks = await this.flash_begin(size, offset, file_size);
    const flash_write_size = this.flash_write_size();

    let block = [];
    let seq = 0;
    let written = 0;
    let position = 0;

    while (file_size - position > 0) {
      if (file_size - position > flash_write_size) {
        block = Array.from(
          image.subarray(position, position + flash_write_size)
        );
        written += block.length;
      } else {
        // Pad the last block
        block = Array.from(image.subarray(position, file_size));
        written += block.length;
        block = block.concat(
          new Array(flash_write_size - block.length).fill(0xff)
        );
      }

      // FLash data works (why?), even the response not being the right size
      try {
        await this.flash_data(block, seq, is_deflate, 0);
        await this.read_timeout(default_timeout);
      } catch (e) {
        console.log('error', e);
      }
      seq += 1;
      position += flash_write_size;

      options.callback?.({
        percent: Math.floor((100 * seq) / blocks),
        seq,
        written,
        position,
        file_size,
        blocks,
      });
    }

    if (options.after !== undefined)
      await this.flash_end(options.after, is_deflate);
  }

  private async flash_begin(
    size: number,
    offset: number,
    compressed_size: number = size,
    encrypted: boolean = false
  ): Promise<number> {
    const chip = await this.chip();

    const flash_write_size = this.flash_write_size();
    await this.spi_attach();

    if (chip === Chip.ESP32)
      await this.command(
        Command.SPI_SET_PARAMS,
        SLIP.pack32(
          0 /* id */,
          this.flash_size.size /* total size in bytes */,
          0x10000 /* block size */,
          4096 /* sector size */,
          256 /* page size */,
          0xffff /* status mask */
        ),
        0
      );

    const num_blocks = Math.floor(
      (compressed_size + flash_write_size - 1) / flash_write_size
    );
    const erase_size = this.erase_size(offset, size);

    const timeout = this._is_stub
      ? default_timeout
      : ESPLoader.timeout_per_mb(ERASE_REGION_TIMEOUT_PER_MB, size);

    const buffer = SLIP.pack32(
      erase_size,
      num_blocks,
      flash_write_size,
      offset
    );

    if (chip === Chip.ESP32S2 && !this._is_stub)
      buffer.push(...SLIP.pack32(encrypted ? 1 : 0));

    await this.command(
      size === compressed_size ? Command.FLASH_BEGIN : Command.FLASH_DEFL_BEGIN,
      buffer,
      0,
      timeout
    );

    return num_blocks;
  }

  private async flash_data(
    data: number[],
    seq: number,
    deflate: boolean = false,
    timeout: number = default_timeout
  ): Promise<void> {
    await this.command(
      deflate ? Command.FLASH_DEFL_DATA : Command.FLASH_DATA,
      SLIP.pack32(data.length, seq, 0, 0).concat(data),
      SLIP.checksum(data),
      timeout
    );
  }

  private async flash_end(
    flag: FlashEndFlag,
    deflate: boolean = false
  ): Promise<void> {
    await this.command(
      deflate ? Command.FLASH_DEFL_END : Command.FLASH_END,
      SLIP.pack32(flag),
      0
    );
  }

  private erase_size(offset: number, size: number): number {
    if (this._chip !== Chip.ESP8266 || this._is_stub) return size;

    const sectors_per_block = 16;
    const num_sectors = Math.floor(
      (size + FLASH_SECTOR_SIZE - 1) / FLASH_SECTOR_SIZE
    );
    const start_sector = Math.floor(offset / FLASH_SECTOR_SIZE);

    let head_sectors = sectors_per_block - (start_sector % sectors_per_block);
    if (num_sectors < head_sectors) head_sectors = num_sectors;

    if (num_sectors < 2 * head_sectors)
      return Math.floor(((num_sectors + 1) / 2) * FLASH_SECTOR_SIZE);

    return (num_sectors - head_sectors) * FLASH_SECTOR_SIZE;
  }

  private async write_mem(data: number[], offset: number): Promise<void> {
    const blocks = Math.floor(
      (data.length + ESP_RAM_BLOCK - 1) / ESP_RAM_BLOCK
    );
    await this.mem_begin(data.length, blocks, ESP_RAM_BLOCK, offset);

    for (let i = 0; i < blocks; i++) {
      const from_offs = i * ESP_RAM_BLOCK;
      let to_offs = from_offs + ESP_RAM_BLOCK;
      if (to_offs > length) to_offs = data.length;
      await this.mem_data(data.slice(from_offs, to_offs), i);
    }
  }

  private async mem_begin(
    total_size: number,
    block_num: number,
    block_size: number,
    offset: number
  ): Promise<Response> {
    return await this.command(
      Command.MEM_BEGIN,
      SLIP.pack32(total_size, block_num, block_size, offset),
      0
    );
  }

  private async mem_data(data: number[], block_seq: number): Promise<Response> {
    return await this.command(
      Command.MEM_DATA,
      SLIP.pack32(data.length, block_seq, 0, 0).concat(...data),
      SLIP.checksum(data)
    );
  }

  private async mem_end(entry_addr: number, timeout = 50): Promise<Response> {
    return await this.command(
      Command.MEM_END,
      SLIP.pack32(
        entry_addr === 0 ? FlashEndFlag.RUN_USER_CODE : FlashEndFlag.REBOOT,
        entry_addr
      ),
      0,
      timeout
    );
  }

  private async spi_attach(): Promise<void> {
    const chip = await this.chip();
    if (![Chip.ESP32, Chip.ESP32S2].includes(chip)) return;
    await this.command(
      Command.SPI_ATTACH,
      new Array(this._is_stub ? 4 : 8).fill(0),
      0
    );
  }

  private async read_chip(): Promise<number> {
    const reg = await this.read_register(Register.CHIP_DETECT_MAGIC);
    this._chip = reg.value;
    return this._chip;
  }

  private async read_efuses(): Promise<Uint32Array> {
    if (this._chip === undefined || !(this._chip in chips))
      throw new ESPFlashError(ErrorCode.CHIP_NOT_DEFINED);

    try {
      this._efuses = new Uint32Array(4);
      for (let i = 0; i < 4; ++i) {
        const packet = await this.read_register(
          chips[this._chip].efuses_addr + 4 * i
        );
        this._efuses[i] = packet.value;
      }
    } catch (e) {
      this._efuses = undefined;
      throw e;
    }
    return this._efuses;
  }

  private async read_register(
    register: Register,
    timeout = default_timeout
  ): Promise<Response> {
    return await this.command(
      Command.READ_REG,
      SLIP.pack32(register),
      0,
      timeout
    );
  }

  private async write_register(
    address: number,
    value: number,
    mask: number = 0xffffffff,
    delay_us = 0,
    timeout = default_timeout
  ): Promise<Response> {
    return await this.command(
      Command.WRITE_REG,
      SLIP.pack32(address, value, mask, delay_us),
      0,
      timeout
    );
  }

  private async wait_silent(
    retries: number = 20,
    timeout: number = 1000
  ): Promise<boolean> {
    while (--retries >= 0) {
      try {
        const d = await this.read_timeout(timeout);
        console.log('wait data', d);
      } catch (e) {
        console.log('waited right');
        return true;
      }
      await sleep(50);
    }
    return false;
  }

  private async command(
    op: Command,
    data: number[],
    checksum: number,
    timeout: number = default_timeout
  ): Promise<Response> {
    await this._serial.write(SLIP.command(op, new Uint8Array(data), checksum));
    if (timeout === 0) return SLIP.empty_response(op, this._is_stub);

    let packet: any;
    let remain: number[] = [];
    const check_command = (data: Uint8Array): boolean => {
      const packets = SLIP.parse(data, this._is_stub, remain);
      remain = packets.remain;
      packet = packets.packets.find(p => p.command === op);
      return packet !== undefined;
    };

    if (!(await this.read_timeout_until(timeout, check_command)))
      throw new ESPFlashError(ErrorCode.RESPONSE_NOT_RECEIVED);

    if (packet instanceof ESPFlashError) throw packet;
    if (packet.status.status === Status.SUCCESS) return packet;
    throw new ESPFlashError(packet.status.error as number);
  }

  private async read_timeout(timeout: number): Promise<Uint8Array> {
    return await new Promise((resolve, reject) => {
      const cb = this._callback;
      this._callback = data => {
        clearTimeout(handler);
        this._callback = cb;
        resolve(data);
      };
      const handler = setTimeout(() => {
        this._callback = cb;
        reject(new ESPFlashError(ErrorCode.TIMEOUT));
      }, timeout);
    });
  }

  private async read_timeout_until(
    timeout: number,
    func: (data: Uint8Array) => boolean
  ): Promise<boolean> {
    while (timeout >= 0) {
      const start = Date.now();
      const response = await this.read_timeout(timeout);
      timeout -= Date.now() - start;

      if (func(response)) return true;
    }
    return false;
  }

  private flash_write_size(): number {
    return this._is_stub ? STUBLOADER_FLASH_WRITE_SIZE : FLASH_WRITE_SIZE;
  }

  // private async flush_input(timeout: number = 100): Promise<void> {
  //   try {
  //     await this.read_timeout(timeout);
  //   } catch (e) {}
  // }

  /*
   Must call spi_attach before use it

   https://github.com/espressif/esptool/blob/da31d9d7a1bb496995f8e30a6be259689948e43e/esptool.py#L675

   Run an arbitrary SPI flash command.

   This function uses the "USR_COMMAND" functionality in the ESP
   SPI hardware, rather than the precanned commands supported by
   hardware. So the value of spiflash_command is an actual command
   byte, sent over the wire.

   After writing command byte, writes 'data' to MOSI and then
   reads back 'read_bits' of reply on MISO. Result is a number.
   */
  private async command_spiflash(
    command: SPICommand,
    data: number[],
    read_bits: number
  ): Promise<Response> {
    if (read_bits > 32)
      throw new ESPFlashError(
        ErrorCode.INVALID_ARGUMENT,
        'Reading more than 32 bits back from a SPI flash operation is unsupported'
      );

    if (data.length > 64) {
      throw new ESPFlashError(
        ErrorCode.INVALID_ARGUMENT,
        'Writing more than 64 bytes of data with one SPI command is unsupported'
      );
    }

    const dchip = await this.chip();
    const chip = chips[dchip];

    // SPI_USR register flags
    const SPI_USR_COMMAND = 1 << 31;
    const SPI_USR_MISO = 1 << 28;
    const SPI_USR_MOSI = 1 << 27;

    // SPI registers, base address differs ESP32* vs 8266
    const base = chip.SPI_REG_BASE;
    const SPI_CMD_REG = base + 0x00;
    const SPI_USR_REG = base + chip.SPI_USR_OFFS;
    const SPI_USR1_REG = base + chip.SPI_USR1_OFFS;
    const SPI_USR2_REG = base + chip.SPI_USR2_OFFS;
    const SPI_W0_REG = base + chip.SPI_W0_OFFS;

    // following two registers are ESP32 & 32S2/32C3 only
    const set_data_lengths =
      chip.SPI_MOSI_DLEN_OFFS !== null
        ? // ESP32/32S2/32C3 has a more sophisticated way to set up "user" commands
          async (mosi_bits: number, miso_bits: number): Promise<void> => {
            const SPI_MOSI_DLEN_REG =
              base + (chip.SPI_MOSI_DLEN_OFFS as number);
            const SPI_MISO_DLEN_REG =
              base + (chip.SPI_MISO_DLEN_OFFS as number);
            if (mosi_bits > 0)
              await this.write_register(SPI_MOSI_DLEN_REG, mosi_bits - 1);
            if (miso_bits > 0)
              await this.write_register(SPI_MISO_DLEN_REG, miso_bits - 1);
          }
        : async (mosi_bits: number, miso_bits: number): Promise<void> => {
            const SPI_DATA_LEN_REG = SPI_USR1_REG;
            const SPI_MOSI_BITLEN_S = 17;
            const SPI_MISO_BITLEN_S = 8;
            const mosi_mask = mosi_bits === 0 ? 0 : mosi_bits - 1;
            const miso_mask = miso_bits === 0 ? 0 : miso_bits - 1;
            await this.write_register(
              SPI_DATA_LEN_REG,
              (miso_mask << SPI_MISO_BITLEN_S) |
                (mosi_mask << SPI_MOSI_BITLEN_S)
            );
          };

    // SPI peripheral "command" bitmasks for SPI_CMD_REG
    const SPI_CMD_USR = 1 << 18;
    // shift values
    const SPI_USR2_COMMAND_LEN_SHIFT = 28;

    const data_bits = data.length * 8;
    const old_spi_usr = await this.read_register(SPI_USR_REG);
    const old_spi_usr2 = await this.read_register(SPI_USR2_REG);
    let flags = SPI_USR_COMMAND;

    if (read_bits > 0) flags |= SPI_USR_MISO;
    if (data_bits > 0) flags |= SPI_USR_MOSI;

    await set_data_lengths(data_bits, read_bits);
    await this.write_register(SPI_USR_REG, flags);
    await this.write_register(
      SPI_USR2_REG,
      (7 << SPI_USR2_COMMAND_LEN_SHIFT) | command
    );

    if (data_bits === 0) {
      await this.write_register(SPI_W0_REG, 0); // clear data register before we read it
    } else {
      data = pad(data, 4, 0x00); // pad to 32-bit multiple
      let next_reg = SPI_W0_REG;
      for (let i = 0; i < data.length - 4; i += 4) {
        await this.write_register(
          next_reg,
          SLIP.unpack32(data.slice(i, i + 4))
        );
        next_reg += 4;
      }
    }

    await this.write_register(SPI_CMD_REG, SPI_CMD_USR);

    const wait_done = async (): Promise<void> => {
      for (let i = 0; i < 10; i++) {
        try {
          const r = await this.read_register(SPI_CMD_REG);
          if ((r.value & SPI_CMD_USR) === 0) return;
        } catch (e) {}
      }
      throw new ESPFlashError(
        ErrorCode.TIMEOUT,
        'SPI command did not complete in time'
      );
    };
    await wait_done();

    const status = await this.read_register(SPI_W0_REG);
    // restore some SPI controller registers
    await this.write_register(SPI_USR_REG, old_spi_usr.value);
    await this.write_register(SPI_USR2_REG, old_spi_usr2.value);

    return status;
  }

  private static timeout_per_mb(
    seconds_per_mb: number,
    size_bytes: number
  ): number {
    const result = Math.floor(seconds_per_mb * (size_bytes / 1e6));
    return result < default_timeout ? default_timeout : result;
  }
}

function pad(data: number[], pad_size: number, pad_byte: number): number[] {
  const remain = data.length % pad_size;
  if (remain === 0) return data;
  data.push(...new Array(remain).fill(pad_byte));
  return data;
}
