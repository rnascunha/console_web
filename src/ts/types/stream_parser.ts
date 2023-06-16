import EventEmitter from './event_emitter';

interface ParseResult {
  data: string;
  result: RegExpExecArray;
}

class ParseUntil {
  private _chunk: string;
  private readonly _break: RegExp;

  constructor(br?: RegExp, chunk?: string) {
    this._chunk = chunk ?? '';
    this._break = br ?? /\r\n|\n|\r(?=.)/; // Match if \r\n, \n or if is a \r with something ahead
  }

  get chunk(): string {
    return this._chunk;
  }

  public clear_chunk(): void {
    this._chunk = '';
  }

  public add_chunk(chunk: string): void {
    this._chunk += chunk;
  }

  public parse_once(): null | ParseResult {
    const result: RegExpExecArray | null = this._break.exec(this._chunk);
    if (result === null) return null;
    const data = this._chunk.substring(0, result.index);
    this._chunk = this._chunk.substring(result.index + result[0].length);
    return {
      data,
      result,
    };
  }

  public parse(): ParseResult[] {
    const res: ParseResult[] = [];
    while (true) {
      const ans = this.parse_once();
      if (ans === null) break;
      res.push(ans);
    }
    return res;
  }
}

export class CheckTimeout {
  private _token: number;
  private readonly _interval: number;
  private readonly _fn: TimerHandler;
  private readonly _args: any[];

  constructor(interval: number, fn: TimerHandler, ...args: any[]) {
    this._fn = fn;
    this._interval = interval;
    this._args = args;
    this._token = 0;
  }

  start(): void {
    // eslint-disable-next-line
    this._token = window.setInterval(this._fn, this._interval, ...this._args);
  }

  public stop(): void {
    clearInterval(this._token);
  }

  public reset(): void {
    this.stop();
    this.start();
  }
}

export interface ParseData {
  data: string;
  size: number;
  raw?: string;
}

interface ParserUntilTimeoutEvents {
  data: ParseData;
}

export class ParseUntilTimeout extends EventEmitter<ParserUntilTimeoutEvents> {
  private readonly _parser: ParseUntil;
  private readonly _timeout: CheckTimeout;
  private readonly _decoder: TextDecoder;

  constructor(interval: number) {
    super();

    this._decoder = new TextDecoder('latin1');
    this._parser = new ParseUntil();
    this._timeout = new CheckTimeout(interval, () => {
      if (this._parser.chunk.length > 0) {
        const data = this._parser.chunk;
        this.emit('data', {
          data: ascii_decoder(data),
          size: data.length,
          raw: data,
        });
        this._parser.clear_chunk();
      }
    });
  }

  public process(data: Uint8Array): void {
    this._parser.add_chunk(this._decoder.decode(data, { stream: true }));
    const result = this._parser.parse();
    for (const d of result) {
      this.emit('data', {
        data: `${ascii_decoder(d.data)}[${ascii_decoder(d.result[0])}]`,
        size: d.data.length + d.result[0].length,
        raw: d.data,
      });
      this._timeout.reset();
    }
  }

  public start(): void {
    this._timeout.start();
  }

  public stop(): void {
    this._timeout.stop();
  }
}

type SpecialChars = Record<string, string>;

const special_chars_list: SpecialChars = {
  '\0': '\\0', // eslint-disable-line
  '\n': '\\n', // eslint-disable-line
  '\r': '\\r', // eslint-disable-line
};

export function ascii_decoder(
  chunk: string,
  chars: SpecialChars = special_chars_list
): string {
  let out: string = '';
  for (const c of chunk) {
    if (c in chars) {
      out += chars[c];
      continue;
    }
    const code = c.charCodeAt(0);
    if (code <= 31 || code >= 127) {
      out += '\\x' + code.toString(16).padStart(2, '0');
    } else out += c;
  }
  return out;
}
