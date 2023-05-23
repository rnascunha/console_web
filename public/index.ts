import Websocket from "./websocket";

interface protocol {
  readonly protocol:string;
  readonly name:string
}

const protocols:Array<protocol> = [
  {protocol: 'ws', name: 'Websocket'},
  {protocol: 'wss', name: 'Secure Wesocket'},
  {protocol: 'http', name: 'HTTP'},
  {protocol: 'https', name: 'Secure HTTP'}
];

type type_data = 'command' | 'recv-data' | 'send-data';

function time() {
  const d = new Date();
  return `${d.getHours()}`.padStart(2, '0') + ':' +
          `${d.getMinutes()}`.padStart(2, '0') + ':' +
          `${d.getSeconds()}`.padStart(2, '0') + '.' +
          `${d.getMilliseconds()}`.padStart(3, '0');
}

class WebsocketView {
  private _sel_protocols:HTMLSelectElement;
  private _btn_connect:HTMLButtonElement;
  private _in_url:HTMLInputElement;
  private _el_data:HTMLElement;
  private _el_error:HTMLElement;
  private _el_input_data:HTMLInputElement;
  private _btn_send_data:HTMLButtonElement;

  private _socket:Websocket|null = null;

  constructor(container:HTMLElement, proto = protocols) {
    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_data = container.querySelector('#data') as HTMLElement;
    this._el_error = container.querySelector('#error') as HTMLElement;
    this._el_input_data = container.querySelector('#input_data') as HTMLInputElement;
    this._btn_send_data = container.querySelector('#send_data') as HTMLButtonElement;

    // this._in_url.focus();

    proto.forEach((v:protocol) => {
      const op = document.createElement('option');
      op.value = v.protocol;
      op.label = v.protocol;
      this._sel_protocols.appendChild(op);
    });

    this._btn_connect.onclick = () => {
      if (this._socket)
        this.close('Requested by user');
      else
        this.open();
    }

    this._btn_send_data.onclick = () => {
      this._send_data();
    }

    this._el_input_data.onkeyup = ev => {
      if (ev.code == 'Enter') {
        ev.preventDefault();
        this._send_data();
      }
    }
  }

  private open() {
    try {
      const url = `${this._sel_protocols.selectedOptions[0].value}://${this._in_url.value}`;
      console.log(`Connecting to: ${url}`);
      this._add_message('command', `Connecting to: ${url}`);
      this._socket = new Websocket(url);
      this._socket.on('open', ev => this._on_open(ev));
      this._socket.on('message', ev => this._on_message(ev));
      this._socket.on('close', ev => this._on_close(ev));
      this._socket.on('error', ev => this._on_error(ev));
    } catch (e) {
      this._error("Error instantiating websocket");
      this._add_message('command', 'Invalid address');
      this._socket = null;
    }
  }

  private close (reason = '') {
    this._socket?.close(1000, reason);
  }

  private _on_open(ev:Event) {
    console.log('open', ev);
    this._error('');
    this._add_message('command', `Connected to ${(ev.currentTarget as WebSocket).url}`);
    this._el_input_data.removeAttribute('disabled');
    this._btn_send_data.removeAttribute('disabled');
    this._btn_connect.textContent = 'Close';
    this._el_input_data.focus();
  }

  private _on_message(ev:MessageEvent) {
    console.log('message', ev);
    this._add_message('recv-data', `<<< ${ev.data}`);
  }

  private _on_close(ev:CloseEvent) {
    console.log('closed', ev);
    this._socket = null;
    this._add_message('command', `Socket closed`);
    this._btn_connect.textContent = 'Connect';
    this._el_input_data.setAttribute('disabled', '');
    this._btn_send_data.setAttribute('disabled', '');
  }

  private _on_error(ev:Event) {
    console.log('error', ev);
    this._error("Error ocurred");
  }

  private _error(message:string = "") {
    console.error(message);
    this._el_error.textContent = message;
  }

  private _add_message(type:type_data, message:string) {
    const p = document.createElement('pre');
    p.classList.add('command-data', type);
    p.textContent += `${time()}: ${message}`;
    this._el_data.appendChild(p);
  }

  private _send_data() {
    if (!this._socket || this._el_input_data.value == '')
        return;
    this._socket.send(this._el_input_data.value);
    this._add_message('send-data', `>>> ${this._el_input_data.value}`);
  }
}

new WebsocketView(document.body);