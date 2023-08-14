import type { SerialConn } from '../../serial/serial';
import * as SLIP from './slip';
import { sleep } from '../../../helper/time';
import { Command, type Response, Register, chips } from './types';
import { ErrorCode, ESPFlashError } from './error';

const default_timeout = 3000;
const sync_packet = [
  0x07, 0x07, 0x12, 0x20, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
  0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
  0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55,
];

export class ESPTool {
  private readonly _serial: SerialConn;
  private _callback?: (data: Uint8Array) => void;

  private readonly _is_stub: boolean = false;
  private _chip?: number;
  private _efuses?: Uint32Array;

  constructor(device: SerialConn) {
    this._serial = device;

    this._serial.on('data', data => {
      if (this._callback !== undefined) this._callback(data);
    });
  }

  async chip(): Promise<number> {
    if (this._chip === undefined) this._chip = await this.read_chip();
    return this._chip;
  }

  async efuses(): Promise<Uint32Array> {
    if (this._efuses === undefined) this._efuses = await this.read_efuses();
    return this._efuses;
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

  async open(
    baud: number,
    open_cb: (esptool: ESPTool) => any,
    close_cb: () => any
  ): Promise<void> {
    this._serial.on('open', () => open_cb(this));
    await this._serial.open({
      baudRate: baud,
    });

    this._serial.on('close', () => {
      close_cb();
    });
  }

  async close(): Promise<void> {
    await this._serial.close();
    this._serial.clear_events();
  }

  async try_connect(): Promise<boolean> {
    for (let i = 0; i < 10; ++i) {
      try {
        await this.signal_bootloader();
        const was_silent = await this.wait_silent(20, 1000);
        if (!was_silent) {
          continue;
        }
        await this.sync();
        return true;
      } catch (e) {
        console.log(
          `[${i.toString().padStart(2, '0')}] ${(e as ESPFlashError).message}`
        );
      }
    }
    return false;
  }

  async set_port_baudrate(baud: number): Promise<void> {
    await this._serial.close();
    await this._serial.open({
      baudRate: baud,
    });
  }

  async signal_reset(): Promise<void> {
    await this._serial.signals({
      dataTerminalReady: false,
      requestToSend: true,
    });
    await sleep(100);
    await this._serial.signals({ dataTerminalReady: true });
  }

  get callback(): ((data: Uint8Array) => void) | undefined {
    return this._callback;
  }

  set callback(cb: ((data: Uint8Array) => void) | undefined) {
    this._callback = cb;
  }

  /**
   * https://github.com/espressif/esptool/blob/9585c0e70274c3543bb420851898f02644d8bc13/esptool/reset.py#L61
   * https://github.com/senseshift/esptool.ts/blob/52d054093299fbe1aa19fde98bd006fe21f42202/src/index.ts#L145
   */
  async signal_bootloader(): Promise<void> {
    // Classic reset
    await this._serial.signals({
      dataTerminalReady: false,
      requestToSend: true,
    });
    await sleep(100);
    await this._serial.signals({
      dataTerminalReady: true,
      requestToSend: false,
    });
    await sleep(50);
    await this._serial.signals({
      dataTerminalReady: false,
      requestToSend: false,
    });
  }

  async sync(retries = 5): Promise<void> {
    for (let i = 0; i < retries; i++) {
      const resp = await this.command(Command.SYNC, sync_packet, 0, 100);
      if (!(resp instanceof ESPFlashError)) return;
    }
    throw new ESPFlashError(ErrorCode.SYNC_ERROR);
  }

  private async read_chip(): Promise<number> {
    const reg = await this.read_register(Register.CHIP_DETECT_MAGIC);
    if (reg instanceof ESPFlashError)
      throw new ESPFlashError(ErrorCode.READ_REG_ERROR);
    this._chip = reg.value;
    return this._chip;
  }

  private async read_efuses(): Promise<Uint32Array> {
    if (this._chip === undefined || !(this._chip in chips))
      throw new ESPFlashError(ErrorCode.CHIP_NOT_DEFINED);

    this._efuses = new Uint32Array(4);
    for (let i = 0; i < 4; ++i) {
      const packet = await this.read_register(
        chips[this._chip].efuses_addr + 4 * i
      );
      if (packet instanceof ESPFlashError) {
        this._efuses = undefined;
        throw packet;
      }
      this._efuses[i] = packet.value;
    }
    return this._efuses;
  }

  private async read_register(
    register: Register,
    timeout = default_timeout
  ): Promise<Response | ESPFlashError> {
    return await this.command(
      Command.READ_REG,
      SLIP.pack32(register),
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
        await this.read_timeout(timeout);
      } catch (e) {
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
  ): Promise<Response | ESPFlashError> {
    let remain: number[] = [];

    await this._serial.write(SLIP.command(op, new Uint8Array(data), checksum));

    while (timeout > 0) {
      const start = Date.now();
      const response = await this.read_timeout(timeout);
      timeout -= Date.now() - start;

      const packets = SLIP.parse(response, this._is_stub, remain);
      remain = packets.remain;
      const packet = packets.packets.find(p => p.command === op);
      if (packet !== undefined) return packet;
    }

    return new ESPFlashError(ErrorCode.RESPONSE_NOT_RECEIVED);
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
}
