export enum ErrorCode {
  SUCCESS = 0x0000,
  // Slip encode/decode errors
  INVALID_BORDER_BYTE = 0x0100,
  PARSE_ERROR = 0x0200,
  PACKET_TOO_SMALL = 0x0300,
  WRONG_DIRECTION = 0x0400,
  SIZE_NOT_MATCH = 0x0500,
  PAYLOAD_TOO_SMALL = 0x0600,

  // Flash error
  TIMEOUT = 0x0a00,
  RESPONSE_NOT_RECEIVED = 0x0b00,
  SYNC_ERROR = 0x0c00,
  CHIP_NOT_DEFINED = 0x0d00,
  EFUSES_NOT_DEFINED = 0x0e00,
  STUB_ALREADY_UPLOAD = 0x0f00,
  FIELD_MISSING = 0x1000,
  UPLOAD_STUB_FAILED = 0x1100,
  STUB_ONLY_COMMAND = 0x1200,
  INVALID_ARGUMENT = 0x1300,
  SERIAL_OCCUPIED = 0x1400,
  SERIAL_DONE = 0x1500,
  NOT_SUPPORTED = 0x1600,
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
  [ErrorCode.PAYLOAD_TOO_SMALL]: 'Payload too small',
  //
  [ErrorCode.TIMEOUT]: 'Command timeout',
  [ErrorCode.RESPONSE_NOT_RECEIVED]: 'Command response not received',
  [ErrorCode.SYNC_ERROR]: 'Device not synced',
  [ErrorCode.CHIP_NOT_DEFINED]: 'Chip not defined',
  [ErrorCode.EFUSES_NOT_DEFINED]: 'Efuses not defined',
  [ErrorCode.STUB_ALREADY_UPLOAD]: 'Stub already uploaded',
  [ErrorCode.FIELD_MISSING]: 'Field missing',
  [ErrorCode.UPLOAD_STUB_FAILED]: 'Upload stub failed',
  [ErrorCode.STUB_ONLY_COMMAND]: 'Command valid only to stub loader',
  [ErrorCode.INVALID_ARGUMENT]: 'Invalid argument',
  [ErrorCode.SERIAL_OCCUPIED]: 'Serial occupied',
  [ErrorCode.SERIAL_DONE]: 'Serial done',
  [ErrorCode.NOT_SUPPORTED]: 'Not supported',
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

  constructor(code: ErrorCode, message?: string) {
    super(message ?? status_error_name(code));
    this._code = code;
  }

  get code(): ErrorCode {
    return this._code;
  }
}
