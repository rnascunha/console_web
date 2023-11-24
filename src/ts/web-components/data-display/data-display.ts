import { time } from '../../helper/time';
import { binary_to_ascii } from '../../libs/binary-dump';
import { base64_encode2 } from '../../libs/base64';
import { roll_to_bottom, is_at_bottom } from '../../helper/element';

type TypeData = 'comm' | 'recv' | 'send' | 'error' | 'warn';

const template_class: HTMLTemplateElement = (function (): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      overflow: hidden;
      height: 100%;
      display: block;
      position: relative;
    }

    #commands {
      padding: 2px;
      border-bottom-left-radius: 2px;
      position: absolute;
      right: 0;
      background-color: grey;
      opacity: 0;
      transition: opacity 0.5s;
    }

    #commands:hover {
      opacity: 1;
    }

    #data {
      display: flex;
      overflow: auto;
      height: 100%;
      margin: 0px;
      padding: 0px;
      background-color: rgb(240, 240, 240);
      scroll-behavior: smooth;
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

    .pressed {
      border-style: inset;
      background-color: darkgrey;
    }

    .not-inverted {
      flex-direction: column;
    }

    .inverted {
      flex-direction: column-reverse;
    }
  </style>
  <div id=commands>
    <button id=clear title=Clear>&#x239A;</button>
    <label title="Follow data"><input type=checkbox checked id=follow>&#x21E3;</label>
    <button id=invert title="Reverse data order">&#x21C5;</button>
  </div>
  <div id=data class=not-inverted></div>`;
  return template;
})();

export interface DataDisplayOptions {
  show_commands?: boolean;
  invert?: boolean;
  follow?: boolean;
}

const default_options: DataDisplayOptions = {
  show_commands: true,
  invert: false,
  follow: true,
};

export default class DataDisplay extends HTMLElement {
  private readonly _data: HTMLElement;
  private readonly _follow: HTMLInputElement;

  constructor(options = {}) {
    super();

    const opt: DataDisplayOptions = { ...default_options, ...options };

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template_class.content.cloneNode(true));
    this._data = shadow.querySelector('#data') as HTMLElement;

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

    this._follow = shadow.querySelector('#follow') as HTMLInputElement;

    shadow.querySelector('#clear')?.addEventListener('click', () => {
      if (this.dispatchEvent(new Event('clear'))) this.clear();
    });

    shadow.querySelector('#invert')?.addEventListener('click', () => {
      if (this.is_inverted()) this.not_invert();
      else this.invert();
    });

    if (opt.show_commands === false)
      (shadow.querySelector('#commands') as HTMLElement).style.display = 'none';
    if (opt.invert === true) this.invert();
    if (opt.follow === false) this._follow.checked = false;
  }

  public get state(): DataDisplayOptions {
    return {
      invert: this.is_inverted(),
      follow: this._follow.checked,
      show_commands:
        (this.shadowRoot?.querySelector('#commands') as HTMLElement).style
          .display !== 'none',
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
      this.data_binary(
        'recv',
        message,
        message_size ?? message.byteLength,
        raw
      );
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

    const is_end = this.is_at_end();
    this._data.appendChild(p);
    if (is_end) this.follow_data(p);
  }

  /**
   * This is not good. Make it better
   */
  private follow_data(el: HTMLElement): void {
    if (this._follow.checked) {
      if (!this.is_inverted()) {
        roll_to_bottom(this._data);
        return;
      }
      el.scrollIntoView();
    }
  }

  /**
   * This is not good. Make it better
   */
  private is_at_end(): boolean {
    if (!this.is_inverted()) {
      return is_at_bottom(this._data);
    } else {
      const d =
        this._data.scrollTop +
        (this._data.scrollHeight - this._data.offsetHeight);
      if (d > 1) return false;
    }
    return true;
  }

  private is_inverted(): boolean {
    return this._data.classList.contains('inverted');
  }

  private invert(): void {
    this._data.classList.add('inverted');
    this._data.classList.remove('not-inverted');
    this.shadowRoot?.querySelector('#invert')?.classList.add('pressed');
  }

  private not_invert(): void {
    this._data.classList.remove('inverted');
    this._data.classList.add('not-inverted');
    this.shadowRoot?.querySelector('#invert')?.classList.remove('pressed');
  }
}

customElements.define('display-data', DataDisplay);
