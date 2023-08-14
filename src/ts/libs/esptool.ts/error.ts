export const error_code = {
  NO_ERROR: 0,
  WRONG_MAGIC_BYTE_HEADER: 1,
  WRONG_MAGIC_WORD_APP: 2,
  WRONG_MAGIC_BYTE_BOOTLOADER: 3,
  HASH_NOT_MATCH: 4,
  NOT_SUPPORTED: 5,
  FILE_NOT_FOUND: 6,
};

type ESPErrorCode = (typeof error_code)[keyof typeof error_code];

export class ESPError extends Error {
  private readonly _code: ESPErrorCode;
  private readonly _args: any;

  constructor(code: ESPErrorCode, message: string, args?: any) {
    super(message);

    this._code = code;
    this._args = args;
  }

  get code(): ESPErrorCode {
    return this._code;
  }

  get args(): any {
    return this._args;
  }
}
