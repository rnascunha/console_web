export enum ErrorCode {
  SUCCESS = 0x0000,
  // Slip encode/decode errors
  INVALID_BORDER_BYTE = 0x0100,
  PARSE_ERROR = 0x0200,
  PACKET_TOO_SMALL = 0x0300,
  WRONG_DIRECTION = 0x0400,
  SIZE_NOT_MATCH = 0x0500,

  // Flash error
  TIMEOUT = 0x0a00,
  RESPONSE_NOT_RECEIVED = 0x0b00,
  SYNC_ERROR = 0x0c00,
  READ_REG_ERROR = 0x0d00,
  CHIP_NOT_DEFINED = 0x0e00,
  EFUSES_NOT_DEFINED = 0x0f00,
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

const error_code_name: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: 'Success',
  //
  [ErrorCode.INVALID_BORDER_BYTE]: 'Invalid border byte',
  [ErrorCode.PARSE_ERROR]: 'Error parsing response',
  [ErrorCode.PACKET_TOO_SMALL]: 'Packet too small',
  [ErrorCode.WRONG_DIRECTION]: 'Wrong byte direction',
  [ErrorCode.SIZE_NOT_MATCH]: 'Size header and payload not match',
  //
  [ErrorCode.TIMEOUT]: 'Command timeout',
  [ErrorCode.RESPONSE_NOT_RECEIVED]: 'Command response not received',
  [ErrorCode.SYNC_ERROR]: 'Device not synced',
  [ErrorCode.READ_REG_ERROR]: 'Error reading register',
  [ErrorCode.CHIP_NOT_DEFINED]: 'Chip not defined',
  [ErrorCode.EFUSES_NOT_DEFINED]: 'Efuses not defined',
} as const;

function status_error_name(
  code: ErrorCode | RomLoadErrorCode | SoftwareLoadErrorCode
): string {
  if (code === 0) return 'Success';
  if (ErrorCode[code] !== undefined) return error_code_name[code as ErrorCode];
  if (rom_load_error[code] !== undefined) return rom_load_error[code];
  if (software_load_error[code] !== undefined) return software_load_error[code];
  return 'undefiend';
}

export class ESPFlashError extends Error {
  private readonly _code: ErrorCode | RomLoadErrorCode | SoftwareLoadErrorCode;

  constructor(code: ErrorCode) {
    super(status_error_name(code));
    this._code = code;
  }

  get code(): ErrorCode {
    return this._code;
  }
}
