import type DataDisplay from '../../web-components/data-display/data-display';
import EventEmitter from '../../libs/event_emitter';
import type { BinaryInputSelect } from '../../web-components/binary-input/text-select-binary';

interface WebSocketEvents {
  open: Event;
  message: MessageEvent;
  close: CloseEvent;
  error: Event;
}

/**
 * https://www.rfc-editor.org/rfc/rfc6455.html#section-11.7
 */
const websocketErrors: Record<number, string> = {
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
  1015: 'TLS handshake',
};

const websocketState: Record<number, string> = {
  0: 'CONNECTING',
  1: 'OPEN',
  2: 'CLOSING',
  3: 'CLOSE',
};

type WebsocketStateName = (typeof websocketState)[keyof typeof websocketState];

function ws_error_name(code: number): string {
  return websocketErrors[code] ?? 'Undefined';
}

export class Websocket extends EventEmitter<WebSocketEvents> {
  private readonly _socket: WebSocket;

  constructor(url: string, protocol: string | string[] = []) {
    super();

    this._socket = new WebSocket(url, protocol);
    this._socket.onopen = ev => {
      this.on_open(ev);
    };
    this._socket.onmessage = ev => {
      this.on_message(ev);
    };
    this._socket.onclose = ev => {
      this.on_close(ev);
    };
    this._socket.onerror = ev => {
      this.on_error(ev);
    };
  }

  get state_number(): number {
    return this._socket.readyState;
  }

  get state(): WebsocketStateName {
    return websocketState[this._socket.readyState];
  }

  get url(): string {
    return this._socket.url;
  }

  public send(message: string | Uint8Array): void {
    this._socket?.send(message);
  }

  public close(code: number = 1000, reason: string = ''): void {
    if (this.state === 'CLOSING' || this.state === 'CLOSED')
      throw new Error('Invalid socket');
    this._socket.close(code, reason);
  }

  private on_open(ev: Event): void {
    this._socket.binaryType = 'arraybuffer';
    this.emit('open', ev);
  }

  private on_message(ev: MessageEvent): void {
    this.emit('message', ev);
  }

  private on_close(ev: CloseEvent): void {
    this.emit('close', ev);
    this.clear_events();
  }

  private on_error(ev: Event): void {
    this.emit('error', ev);
  }
}

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <div>
    <text-select-binary class=input_data disabled selected=text></text-select-binary>
    <button class=send_data disabled>Send</button>
    <button class=close_conn disabled>Close</button>
    <button class=clear>Clear</button>
  </div>
  <display-data class=data></display-data>
`;
  return template;
})();

export class WebsocketView extends EventEmitter<WebSocketEvents> {
  private _socket: Websocket;

  private readonly _container: HTMLElement;
  private readonly _in_data: BinaryInputSelect;
  private readonly _btn_send_data: HTMLButtonElement;
  private readonly _btn_close: HTMLButtonElement;
  private readonly _data: DataDisplay;

  constructor(socket: Websocket) {
    super();

    this._socket = socket;

    this._container = document.createElement('div');
    this._container.classList.add('golden-content');
    this._container.appendChild(template.content.cloneNode(true));

    this._in_data = this._container.querySelector(
      '.input_data'
    ) as BinaryInputSelect;
    this._btn_send_data = this._container.querySelector(
      '.send_data'
    ) as HTMLButtonElement;
    this._btn_close = this._container.querySelector(
      '.close_conn'
    ) as HTMLButtonElement;
    this._data = this._container.querySelector('.data') as DataDisplay;

    this._btn_send_data.onclick = () => {
      this.send_data();
    };
    this._btn_close.onclick = () => {
      this.close();
    };

    this._in_data.onkeyup = ev => {
      if (ev.code === 'Enter') {
        ev.preventDefault();
        this.send_data();
      }
    };

    (this._container.querySelector('.clear') as HTMLElement).onclick = () => {
      this._data.clear();
    };

    this.config_socket();
  }

  public get container(): HTMLElement {
    return this._container;
  }

  public get socket(): Websocket {
    return this._socket;
  }

  public set socket(s: Websocket) {
    this._socket = s;
    this.config_socket();
  }

  private config_socket(): void {
    // Workaround...
    customElements
      .whenDefined('display-data')
      .then(() => {
        this._data.command(`Connecting to ${this._socket.url}`);
      })
      .finally(() => {});
    this._socket.on('open', ev => {
      this.on_open(ev);
    });
    this._socket.on('message', ev => {
      this.on_message(ev);
    });
    this._socket.on('close', ev => {
      this.on_close(ev);
    });
    this._socket.on('error', ev => {
      this.on_error(ev);
    });
  }

  public close(reason = ''): void {
    if (this._socket.state === 'CLOSING' || this._socket.state === 'CLOSED')
      return;
    this._socket.close(1000, reason);
  }

  private on_open(ev: Event): void {
    this.error('');
    this._data.command(`Connected to ${(ev.currentTarget as WebSocket).url}`);
    this._in_data.removeAttribute('disabled');
    this._btn_send_data.removeAttribute('disabled');
    this._btn_close.removeAttribute('disabled');
    this._in_data.focus();
    this.emit('open', ev);
  }

  private on_message(ev: MessageEvent): void {
    if (typeof ev.data === 'string')
      this._data.receive(ev.data, ev.data.length, ev.data);
    else this._data.receive(new Uint8Array(ev.data as ArrayBuffer));
  }

  private on_close(ev: CloseEvent): void {
    this.to_close(ev.code);
    this.emit('close', ev);
  }

  private to_close(code = 1000): void {
    this._data.command(`Closed [${code}:${ws_error_name(code)}]`);
    this._in_data.setAttribute('disabled', '');
    this._btn_send_data.setAttribute('disabled', '');
    this._btn_close.setAttribute('disabled', '');
  }

  private on_error(ev: Event): void {
    this.error('Error ocurred');
  }

  public error(message: string = ''): void {
    if (message.length > 0) {
      this._data.error(message);
    }
  }

  private send_data(): void {
    if (this._socket.state === 'CLOSING' || this._socket.state === 'CLOSED') {
      this.to_close(1006);
      this.emit('close', new CloseEvent('Close'));
      return;
    }
    const data = this._in_data.data;
    if (data.length === 0) return;

    if (this._in_data.encode !== 'text') {
      this._socket.send(data);
    } else {
      this._socket.send(new TextDecoder('latin1').decode(data));
    }
    this._data.send(data);
  }
}
