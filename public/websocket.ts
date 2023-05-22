import EventEmitter from "./event_emitter.js";

type WebSocketEvents = {
  open: Event;
  message: MessageEvent,
  close: CloseEvent,
  error: Event
};

/**
 * https://www.rfc-editor.org/rfc/rfc6455.html#section-11.7
 */
export const WebSocketErrors:Record<number, string> = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol error',
  1003: 'Unsupported Data',
  1005: 'No Status Rcvd',
  1006: 'Abnormal Closure',
  1007: 'Invalid frame',
  1008: 'Policy Violation',
  1009: 'Message Too Big',
  1010: 'Mandatory Ext.',
  1011: 'Internal Server Error',
  1015: 'TLS handshake'
};

export default class Websocket extends EventEmitter<WebSocketEvents> {
  private _socket : WebSocket | null = null;

  constructor(url:string, protocol:string | Array<string> = []) {
    super();
    try {
      this._socket = new WebSocket(url, protocol);
      this._socket.onopen = ev => this.on_open(ev);
      this._socket.onmessage = ev => this.on_message(ev);
      this._socket.onclose = ev => this.on_close(ev);
      this._socket.onerror = ev => this.on_error(ev);
    }
    catch(e) {
      console.log('catch constructor', e);
      this._socket = null;
      throw e;
    }
  }

  public send(message:string) {
    this._socket?.send(message);
  }

  public close(code:number = 1000, reason:string = "") {
    if (this._socket === null)
      throw "no valid socket";
    this._socket.close(code, reason);
  }

  private on_open(ev:Event) {
    this.emit('open', ev);
  }

  private on_message(ev:MessageEvent) {
    this.emit('message', ev);
  }

  private on_close(ev:CloseEvent) {
    this._socket = null;
    this.emit('close', ev);
    this.clear_events();
  }

  private on_error(ev:Event) {
    this.emit('error', ev);
  }
}