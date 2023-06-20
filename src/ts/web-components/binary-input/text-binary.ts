import {
  type Encoding,
  is_encode_char,
  split,
  format,
  convert,
  to_data,
  check_encoding,
} from '../../libs/binary-dump';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }
    input {
      width: 100%;
    }
  </style>
  <input>`;
  return template;
})();

export class BinaryInput extends HTMLElement {
  private _encode: Encoding = 'hexa';
  private readonly _input: HTMLInputElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
    this._input = this.shadowRoot?.querySelector('input') as HTMLInputElement;

    this._input.onkeydown = ev => {
      if (ev.ctrlKey) return;
      if (['Backspace', 'Delete', 'Tab'].includes(ev.key)) return;
      if (ev.key.startsWith('Arrow')) return;
      if (ev.key === 'Escape') {
        this.clear();
        return;
      }
      if (!is_encode_char(ev.key, this._encode)) ev.preventDefault();
    };

    this._input.onkeyup = ev => {
      const position = this._input.selectionStart;
      this.format(this._input.value);
      if (['Delete'].includes(ev.key)) this._input.selectionEnd = position;
    };

    this._input.onpaste = ev => {
      ev.preventDefault();
      this.format(ev.clipboardData?.getData('text') ?? '');
    };

    this._input.focus();
  }

  get value(): string {
    return this._input.value;
  }

  get data(): Uint8Array {
    return to_data(split(this.value, this._encode), this._encode);
  }

  set encode(enc: Encoding) {
    check_encoding(enc);
    if (enc === this._encode) return;
    this._input.value = format(
      convert(split(this.value, this._encode), this._encode, enc),
      enc,
      { separator: ' ', pad: '0' }
    );

    this._encode = enc;
  }

  get encode(): Encoding {
    return this._encode;
  }

  public clear(): void {
    this._input.value = '';
  }

  private format(str: string): void {
    this._input.value = format(split(str, this._encode), this._encode);
  }
}

customElements.define('text-binary', BinaryInput);
