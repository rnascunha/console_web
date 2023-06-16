import { time } from '../../helper/time';
import { string_to_binary } from '../../helper/encode';
import { BinaryDump } from '../binary-dump/binary-dump';
import { create_window } from '../../window';

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

      const d = string_to_binary(el.dataset.data as string);

      const body = new BinaryDump(8, d);

      const win = create_window('Binary Dump', body);
      document.body.appendChild(win);
      win.center();
      win.addEventListener('undock', () => {
        window.console_app.layout.createPopout(
          window.console_app.layout.newComponent(
            'DockDumpComponent',
            el.dataset.data as string
          ),
          {
            width: win.clientWidth,
            height: win.clientHeight - win.header.clientHeight,
            left: win.offsetLeft,
            top: win.offsetTop,
          },
          null,
          null
        );
        win.close();
      });
    };
  }

  public clear(): void {
    this._data.innerHTML = '';
  }

  public send(message: string, message_size?: number, raw?: string): void {
    this.add_message('send', message, message_size, raw);
  }

  public receive(message: string, message_size?: number, raw?: string): void {
    this.add_message('recv', message, message_size, raw);
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
