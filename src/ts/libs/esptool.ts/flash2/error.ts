export enum ErrorCode {
  SUCCESS = 0,
  // Slip encode/decode errors
  INVALID_BORDER_BYTE = 1,
  PARSE_ERROR = 2,
  PACKET_TOO_SMALL = 3,
  WRONG_DIRECTION = 4,
  SIZE_NOT_MATCH = 5,

  // Flash error
  TIMEOUT = 10,
  RESPONSE_NOT_RECEIVED = 11,
  SYNC_ERROR = 12,
  READ_REG_ERROR = 13,
  CHIP_NOT_DEFINED = 14,
  EFUSES_NOT_DEFINED = 15,
}

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

export class ESPFlashError extends Error {
  private readonly _code: ErrorCode;

  constructor(code: ErrorCode) {
    super(
      error_code_name[code] !== undefined ? error_code_name[code] : 'undefiend'
    );
    this._code = code;
  }

  get code(): ErrorCode {
    return this._code;
  }
}
