import { time } from '../../helper/time';
import { binary_to_ascii } from '../../libs/binary-dump';
import { base64_encode2 } from '../../libs/base64';

type TypeData = 'comm' | 'recv' | 'send' | 'error' | 'warn';

const template_class: HTMLTemplateElement = (function (): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      overflow: hidden;
      height: 100%;
      display: block;
    }

    #data {
      overflow: auto;
      height: 100%;
      margin: 0px;
      padding: 0px;
    }

    .command-data {
      margin: 0px;
      padding: 3px;
      white-space: break-spaces;
    }

    .command-data[data-data] {
      cursor: pointer;
    }

    .command-data:hover {
      filter: brightness(1.2);
    }
    
    .comm {
      background-color: lightgray;
    }
    
    .recv {
      background-color: limegreen;
    }
    
    .send {
      background-color: green;
    }
    
    .error {
      background-color: red;
      color: white;
    }

    .warn {
      background-color: yellow;
    }
  </style>
  <div id=data></div>`;
  return template;
})();

export default class DataDisplay extends HTMLElement {
  private readonly _data: HTMLElement;
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template_class.content.cloneNode(true));
    this._data = this.shadowRoot?.querySelector('#data') as HTMLElement;

    this._data.onclick = ev => {
      const el = ev.composedPath()[0] as HTMLElement;
      if (!('data' in el.dataset)) return;
      this.dispatchEvent(
        new CustomEvent('click-data', {
          bubbles: true,
          detail: {
            data: el.dataset.data,
          },
        })
      );
    };
  }

  public clear(): void {
    this._data.innerHTML = '';
  }

  public send(
    message: string | Uint8Array,
    message_size?: number,
    raw?: string | Uint8Array
  ): void {
    if (message instanceof Uint8Array)
      this.data_binary('send', message, message_size, raw);
    else this.data_string('send', message, message_size, raw);
  }

  public receive(
    message: string | Uint8Array,
    message_size?: number,
    raw?: string | Uint8Array
  ): void {
    if (message instanceof Uint8Array)
      this.data_binary('recv', message, message_size, raw);
    else this.data_string('recv', message, message_size, raw);
  }

  private data_string(
    type: 'recv' | 'send',
    message: string,
    message_size?: number,
    raw?: string | Uint8Array
  ): void {
    this.add_message(
      type,
      message,
      message_size,
      base64_encode2(raw ?? message)
    );
  }

  private data_binary(
    type: 'recv' | 'send',
    message: Uint8Array,
    message_size?: number,
    raw?: string | Uint8Array
  ): void {
    this.add_message(
      type,
      binary_to_ascii(message),
      message_size,
      base64_encode2(raw ?? message)
    );
  }

  public command(message: string): void {
    this.add_message('comm', message);
  }

  public error(message: string): void {
    this.add_message('error', message);
  }

  public warning(message: string): void {
    this.add_message('warn', message);
  }

  public add_message(
    type: TypeData,
    message: string,
    message_size?: number,
    raw?: string
  ): void {
    const p = document.createElement('pre');
    p.classList.add('command-data', type);
    const size = `${message_size ?? message.length}`.padStart(3, '0');

    if (raw !== undefined) p.dataset.data = raw;

    let out = `${time()} `;
    if (type === 'send') out += `<<< [${size}]`;
    else if (type === 'recv') out += `>>> [${size}]`;
    p.textContent = `${p.textContent ?? ''}${out} ${message}`;
    this._data.appendChild(p);
    this.go_to_bottom();
  }

  public go_to_bottom(): void {
    this._data.scrollTo(0, this._data.scrollHeight);
  }
}

customElements.define('display-data', DataDisplay);
