import EventEmitter from "./event_emitter";

interface ParseResult {
  data:string,
  result:RegExpExecArray
};

class ParseUntil {
  private _chunk:string;
  private _break:RegExp;

  constructor(br?:RegExp, chunk?:string) {
    this._chunk = chunk ?? "";
    this._break = br ?? /\r\n|\n|\r(?=.)/;  // Match if \r\n, \n or if is a \r with something ahead
  }

  get chunk() : string {
    return this._chunk;
  }

  public clear_chunk() {
    this._chunk = "";
  }

  public add_chunk(chunk:string) {
    this._chunk += chunk;
  }

  public parse_once() : null|ParseResult {
    let result:RegExpExecArray|null = this._break.exec(this._chunk);
    if (!result)
      return null
    const data = this._chunk.substring(0, result.index);
    this._chunk = this._chunk.substring(result.index + result[0].length);
    return {
      data,
      result
    };
  }

  public parse() : Array<ParseResult> {
    const res = [];
    while(true) {
      let ans = this.parse_once();
      if (!ans) break;
      res.push(ans);
    }
    return res;
  }
};

export class CheckTimeout {
  private _token:number;
  private _interval:number;
  private _fn:TimerHandler;
  private _args:any[];

  constructor(interval:number, fn:TimerHandler, ...args:any[]) {
    this._fn = fn;
    this._interval = interval;
    this._args = args;
    this._token = 0;
  }

  start() {
    this._token = window.setInterval(this._fn, this._interval, ...this._args);
  }

  public stop() {
    clearInterval(this._token);
  }

  public reset() {
    this.stop();
    this.start();
  }
};

export interface ParseData {
  data:string,
  size:number
};

interface ParserUntilTimeoutEvents {
  data: ParseData
}

export class ParseUntilTimeout extends EventEmitter<ParserUntilTimeoutEvents> {
  private _parser:ParseUntil;
  private _timeout:CheckTimeout;
  private _decoder:TextDecoder;
  
  constructor(interval:number) {
    super();

    this._decoder = new TextDecoder('utf-8');
    this._parser = new ParseUntil();
    this._timeout = new CheckTimeout(interval, () => {
      if (this._parser.chunk.length > 0) {
        const data = this._parser.chunk;
        this.emit('data', {data: ascii_decoder(data), size: data.length});
        this._parser.clear_chunk();
      };
    });
  }

  public process(data:Uint8Array) {
    this._parser.add_chunk(this._decoder.decode(data, {stream: true}));
    const result = this._parser.parse();
    for (const d of result) {
      this.emit('data', {data: `${ascii_decoder(d.data)}[${ascii_decoder(d.result[0])}]`,
                         size: d.data.length + d.result[0].length});
      this._timeout.reset();
    }
  }

  public start() {
    this._timeout.start();
  }

  public stop() {
    this._timeout.stop();
  }
};

type special_chars = Record<string, string>;
const special_chars_list:special_chars = {
  '\0': '\\0',
  '\n': '\\n',
  '\r': '\\r'
};

export function ascii_decoder(chunk:string, chars:special_chars = special_chars_list) : string {
  let out:string = "";
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