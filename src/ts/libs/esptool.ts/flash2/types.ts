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

export enum Register {
  CHIP_DETECT_MAGIC = 0x40001000,
}

export const rom_load_error: Record<number, string> = {
  0x05: 'Received message is invalid',
  0x06: 'Failed to act on received message',
  0x07: 'Invalid CRC in message',
  0x08: 'flash write error',
  0x09: 'flash read error',
  0x0a: 'flash read length error',
  0x0b: 'Deflate error',
} as const;

export const software_load_error: Record<number, string> = {
  0xc0: 'ESP_BAD_DATA_LEN',
  0xc1: 'ESP_BAD_DATA_CHECKSUM',
  0xc2: 'ESP_BAD_BLOCKSIZE',
  0xc3: 'ESP_INVALID_COMMAND',
  0xc4: 'ESP_FAILED_SPI_OP',
  0xc5: 'ESP_FAILED_SPI_UNLOCK',
  0xc6: 'ESP_NOT_IN_FLASH_MODE',
  0xc7: 'ESP_INFLATE_ERROR',
  0xc8: 'ESP_NOT_ENOUGH_DATA',
  0xc9: 'ESP_TOO_MUCH_DATA',

  0xff: 'ESP_CMD_NOT_IMPLEMENTED',
} as const;

export type RomLoadErrorCode = keyof typeof rom_load_error;
export type SoftwareLoadErrorCode = keyof typeof software_load_error;

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

const ESP8266 = 0xfff0c101; // eslint-disable-line
const ESP32 = 0x00f01d83; // eslint-disable-line
const ESP32S2 = 0x000007c6; // eslint-disable-line

interface ChipDescription {
  name: string;
  efuses_addr: number;
  efuses_to_mac: (efuses: number[]) => number[] | undefined;
  SPI_REG_BASE?: number; // eslint-disable-line
  SPI_USR_OFFS?: number; // eslint-disable-line
  SPI_USR1_OFFS?: number; // eslint-disable-line
  SPI_USR2_OFFS?: number; // eslint-disable-line
  SPI_MOSI_DLEN_OFFS?: number | null; // eslint-disable-line
  SPI_MISO_DLEN_OFFS?: number | null; // eslint-disable-line
  SPI_W0_OFFS?: number; // eslint-disable-line
}

export const chips: Record<number, ChipDescription> = {
  [ESP8266]: {
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
  [ESP32]: {
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
  [ESP32S2]: {
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
