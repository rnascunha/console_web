
interface ParseResult {
  data:string,
  result:RegExpExecArray
};

export class parse_until {
  private _chunk:string;
  private _break:RegExp;

  constructor(chunk?:string, br?:RegExp) {
    this._chunk = chunk ?? "";
    this._break = br ?? /\r\n|\n|\r/;
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

export class check_timeout {
  private _token:number;
  private _interval:number;
  private _fn:TimerHandler;
  private _args:any[];

  constructor(interval:number, fn:TimerHandler, ...args:any[]) {
    this._fn = fn;
    this._interval = interval;
    this._args = args;
    this._token = window.setInterval(this._fn, this._interval, ...this._args);
  }

  public stop() {
    clearInterval(this._token);
  }

  public reset() {
    this.stop();
    this._token = window.setInterval(this._fn, this._interval, ...this._args);
  }
};