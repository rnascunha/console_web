import EventEmitter from "./event_emitter";

type WebSocketEvents = {
  open: Event;
  message: MessageEvent,
  close: CloseEvent,
  error: Event
};

/**
 * https://www.rfc-editor.org/rfc/rfc6455.html#section-11.7
 */
const WebsocketErrors:Record<number, string> = {
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

const WebsocketState:Record<number, string> = {
  0: 'CONNECTING',
  1: 'OPEN',
  2: 'CLOSING',
  3: 'CLOSE',
  4: 'UNDEFINED'
};

function ws_error_name(code:number) : string {
  if (code in WebsocketErrors)
    return WebsocketErrors[code];
  return 'Undefined';
}

export class Websocket extends EventEmitter<WebSocketEvents> {
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

  get state() : number {
    if (!this._socket)
      return 4;
    return this._socket.readyState;
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

type type_data = 'command' | 'recv-data' | 'send-data' | 'error-data';

function time() : string {
  const d = new Date();
  return `${d.getHours()}`.padStart(2, '0') + ':' +
          `${d.getMinutes()}`.padStart(2, '0') + ':' +
          `${d.getSeconds()}`.padStart(2, '0') + '.' +
          `${d.getMilliseconds()}`.padStart(3, '0');
}

export class WebsocketView {
  private _socket:Websocket|null = null;

  private _container:HTMLElement;
  private _in_data:HTMLInputElement;
  private _btn_send_data:HTMLButtonElement;
  private _btn_close:HTMLButtonElement;
  private _out_data:HTMLElement;

  constructor(socket:Websocket) {
    this._socket = socket;
    this._socket.on('open', ev => this._on_open(ev));
    this._socket.on('message', ev => this._on_message(ev));
    this._socket.on('close', ev => this._on_close(ev));
    this._socket.on('error', ev => this._on_error(ev));

    this._container = document.createElement('div');
    this._container.innerHTML = `<div>
                                  <input class=input_data disabled>
                                  <button class=send_data disabled>Send</button>
                                  <button class=close_conn disabled>Close</button>
                                </div>
                                <div class=data></div>`;

    this._in_data = this._container.querySelector('.input_data') as HTMLInputElement;
    this._btn_send_data = this._container.querySelector('.send_data') as HTMLButtonElement;
    this._btn_close = this._container.querySelector('.close_conn') as HTMLButtonElement;
    this._out_data = this._container.querySelector('.data') as HTMLElement;

    this._btn_send_data.onclick = () => this._send_data();
    this._btn_close.onclick = () => this.close();

    this._in_data.onkeyup = ev => {
      if (ev.code == 'Enter') {
        ev.preventDefault();
        this._send_data();
      }
    }
  }

  public get container() : HTMLElement {
    return this._container;
  }

  public close (reason = '') {
    this._socket?.close(1000, reason);
  }

  private _on_open(ev:Event) {
    this._error('');
    this._add_message('command', `Connected to ${(ev.currentTarget as WebSocket).url}`);
    this._in_data.removeAttribute('disabled');
    this._btn_send_data.removeAttribute('disabled');
    this._btn_close.removeAttribute('disabled');
    this._in_data.focus();
  }

  private _on_message(ev:MessageEvent) {
    this._add_message('recv-data', `<<< ${ev.data}`);
  }

  private _on_close(ev:CloseEvent) {
    this._to_close(ev.code);
  }

  private _to_close(code = 1000) {
    this._socket = null;
    this._add_message('command', `Closed [${code}:${ws_error_name(code)}]`);
    this._in_data.setAttribute('disabled', '');
    this._btn_send_data.setAttribute('disabled', '');
    this._btn_close.setAttribute('disabled', '');
  }

  private _on_error(ev:Event) {
    console.error('error', ev);
    this._error("Error ocurred");
  }

  private _error(message:string = "") {
    if (message.length > 0) {
      this._add_message('error-data', message);
    }
  }

  private _add_message(type:type_data, message:string) {
    const p = document.createElement('pre');
    p.classList.add('command-data', type);
    p.textContent += `${time()}: ${message}`;
    this._out_data.appendChild(p);
  }

  private _send_data() {
    if (!this._socket || this._socket.state == 2 || this._socket.state == 3) {
      this._to_close(1006);
      return;
    }
    if (this._in_data.value == '')
      return;

    this._socket.send(this._in_data.value);
    this._add_message('send-data', `>>> ${this._in_data.value}`);
  }
}
