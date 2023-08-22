export enum Direction {
  COMMAND = 0x00,
  RESPONSE = 0x01,
}

export enum Status {
  SUCCESS = 0,
  FAILURE = 1,
}

export enum Command {
  FLASH_BEGIN = 0x02,
  FLASH_DATA = 0x03,
  FLASH_END = 0x04,
  MEM_BEGIN = 0x05,
  MEM_END = 0x06,
  MEM_DATA = 0x07,
  SYNC = 0x08,
  WRITE_REG = 0x09,
  READ_REG = 0x0a,
  SPI_SET_PARAMS = 0x0b,
  SPI_ATTACH = 0x0d,
  CHANGE_BAUDRATE = 0x0f,
  FLASH_DEFL_BEGIN = 0x10,
  FLASH_DEFL_DATA = 0x11,
  FLASH_DEFL_END = 0x12,
  SPI_FLASH_MD5 = 0x13,

  // stub loader only
  ERASE_FLASH = 0xd0,
  ERASE_REGION = 0xd1,
  READ_FLASH = 0xd2,
  RUN_USER_CODE = 0xd3,
}

export enum FlashEndFlag {
  REBOOT = 0,
  RUN_USER_CODE = 1,
}

export enum Register {
  CHIP_DETECT_MAGIC = 0x40001000,
  UART_CLKDIV_REG = 0x3ff40014,
}

export interface StatysBytes {
  status: Status;
  error?: number;
}

export interface Response {
  direction: Direction;
  command: Command;
  size: number;
  value: number;
  data: number[];
  status: StatysBytes;
}

export interface Packets {
  packets: Response[];
  remain: number[];
}

export enum Chip {
  ESP8266 = 0xfff0c101,
  ESP32 = 0x00f01d83,
  ESP32S2 = 0x000007c6,
}

interface ChipDescription {
  name: string;
  efuses_addr: number;
  efuses_to_mac: (efuses: number[]) => number[] | undefined;
  SPI_REG_BASE: number; // eslint-disable-line
  SPI_USR_OFFS: number; // eslint-disable-line
  SPI_USR1_OFFS: number; // eslint-disable-line
  SPI_USR2_OFFS: number; // eslint-disable-line
  SPI_MOSI_DLEN_OFFS?: number | null; // eslint-disable-line
  SPI_MISO_DLEN_OFFS?: number | null; // eslint-disable-line
  SPI_W0_OFFS: number; // eslint-disable-line
}

export const chips: Record<Chip, ChipDescription> = {
  [Chip.ESP8266]: {
    name: 'ESP8266',
    efuses_addr: 0x3ff00050,
    efuses_to_mac: function (efuses: number[]) {
      let oui;
      if (efuses[3] !== 0) {
        oui = [
          (efuses[3] >> 16) & 0xff,
          (efuses[3] >> 8) & 0xff,
          efuses[3] & 0xff,
        ];
      } else if (((efuses[1] >> 16) & 0xff) === 0) {
        oui = [0x18, 0xfe, 0x34];
      } else if (((efuses[1] >> 16) & 0xff) === 1) {
        oui = [0xac, 0xd0, 0x74];
      } else {
        return undefined;
      }

      return [
        oui[0],
        oui[1],
        oui[2],
        (efuses[1] >> 8) & 0xff,
        efuses[1] & 0xff,
        (efuses[0] >> 24) & 0xff,
      ];
    },
    SPI_REG_BASE: 0x60000200,
    SPI_USR_OFFS: 0x1c,
    SPI_USR1_OFFS: 0x20,
    SPI_USR2_OFFS: 0x24,
    SPI_MOSI_DLEN_OFFS: null,
    SPI_MISO_DLEN_OFFS: null,
    SPI_W0_OFFS: 0x40,
  },
  [Chip.ESP32]: {
    name: 'ESP32',
    efuses_addr: 0x3ff5a000,
    efuses_to_mac: function (efuses: number[]) {
      return [
        (efuses[2] >> 8) & 0xff,
        efuses[2] & 0xff,
        (efuses[1] >> 24) & 0xff,
        (efuses[1] >> 16) & 0xff,
        (efuses[1] >> 8) & 0xff,
        efuses[1] & 0xff,
      ];
    },
    SPI_REG_BASE: 0x3ff42000,
    SPI_USR_OFFS: 0x1c,
    SPI_USR1_OFFS: 0x20,
    SPI_USR2_OFFS: 0x24,
    SPI_MOSI_DLEN_OFFS: 0x28,
    SPI_MISO_DLEN_OFFS: 0x2c,
    SPI_W0_OFFS: 0x80,
  },
  [Chip.ESP32S2]: {
    name: 'ESP32-S2',
    efuses_addr: 0x6001a000,
    efuses_to_mac: function (efuses: number[]) {
      return [
        (efuses[2] >> 8) & 0xff,
        efuses[2] & 0xff,
        (efuses[1] >> 24) & 0xff,
        (efuses[1] >> 16) & 0xff,
        (efuses[1] >> 8) & 0xff,
        efuses[1] & 0xff,
      ];
    },
    SPI_REG_BASE: 0x3f402000,
    SPI_USR_OFFS: 0x18,
    SPI_USR1_OFFS: 0x1c,
    SPI_USR2_OFFS: 0x20,
    SPI_MOSI_DLEN_OFFS: 0x24,
    SPI_MISO_DLEN_OFFS: 0x28,
    SPI_W0_OFFS: 0x58,
  },
};

// https://github.com/espressif/esptool/blob/9585c0e70274c3543bb420851898f02644d8bc13/esptool/cmds.py#L43
export enum FlashSizeHandler {
  FS256KB = 0x12,
  FS512KB = 0x13,
  FS1MB = 0x14,
  FS2MB = 0x15,
  FS4MB = 0x16,
  FS8MB = 0x17,
  FS16MB = 0x18,
  FS32MB = 0x19,
  FS64MB = 0x20,
  FS128MB = 0x21,
  FS256MB = 0x22,

  FS256KB_2 = 0x32,
  FS512KB_2 = 0x33,
  FS1MB_2 = 0x34,
  FS2MB_2 = 0x35,
  FS4MB_2 = 0x36,
  FS8MB_2 = 0x37,
  FS16MB_2 = 0x38,
  FS32MB_2 = 0x39,
  FS64MB_2 = 0x3a,
}

export interface FlashSizeDescription {
  name: string;
  size: number;
}

export const flash_sizes: Record<FlashSizeHandler, FlashSizeDescription> = {
  [FlashSizeHandler.FS256KB]: { name: '256KB', size: 256 * 1024 },
  [FlashSizeHandler.FS512KB]: { name: '512KB', size: 512 * 1024 },
  [FlashSizeHandler.FS1MB]: { name: '1MB', size: 1 * 1024 * 1024 },
  [FlashSizeHandler.FS2MB]: { name: '2MB', size: 2 * 1024 * 1024 },
  [FlashSizeHandler.FS4MB]: { name: '4MB', size: 4 * 1024 * 1024 },
  [FlashSizeHandler.FS8MB]: { name: '8MB', size: 8 * 1024 * 1024 },
  [FlashSizeHandler.FS16MB]: { name: '16MB', size: 16 * 1024 * 1024 },
  [FlashSizeHandler.FS32MB]: { name: '32MB', size: 32 * 1024 * 1024 },
  [FlashSizeHandler.FS64MB]: { name: '64MB', size: 64 * 1024 * 1024 },
  [FlashSizeHandler.FS128MB]: { name: '128MB', size: 128 * 1024 * 1024 },
  [FlashSizeHandler.FS256MB]: { name: '256MB', size: 256 * 1024 * 1024 },

  [FlashSizeHandler.FS256KB_2]: { name: '256KB', size: 256 * 1024 },
  [FlashSizeHandler.FS512KB_2]: { name: '512KB', size: 512 * 1024 },
  [FlashSizeHandler.FS1MB_2]: { name: '1MB', size: 1 * 1024 * 1024 },
  [FlashSizeHandler.FS2MB_2]: { name: '2MB', size: 2 * 1024 * 1024 },
  [FlashSizeHandler.FS4MB_2]: { name: '4MB', size: 4 * 1024 * 1024 },
  [FlashSizeHandler.FS8MB_2]: { name: '8MB', size: 8 * 1024 * 1024 },
  [FlashSizeHandler.FS16MB_2]: { name: '16MB', size: 16 * 1024 * 1024 },
  [FlashSizeHandler.FS32MB_2]: { name: '32MB', size: 32 * 1024 * 1024 },
  [FlashSizeHandler.FS64MB_2]: { name: '64MB', size: 64 * 1024 * 1024 },
} as const;

export interface FlashImageProgress {
  seq: number;
  blocks: number;
  written: number;
  position: number;
  percent: number;
  file_size: number;
}

export type FlashImageProgressCallback = (data: FlashImageProgress) => void;

export interface FlashImageOptions {
  after?: FlashEndFlag;
  callback?: FlashImageProgressCallback;
}
