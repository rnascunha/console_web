import {
  type Encoding,
  is_encode_char,
  split,
  format,
  convert,
  to_data,
  check_encoding,
  to_array_string,
  clear_string,
} from '../../libs/binary-dump';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }

    textarea{
      width: 100%;
      box-sizing: border-box;
    }
  </style>
  <textarea></textarea>`;
  return template;
})();

export class BinaryAreaInput extends HTMLElement {
  private _encode: Encoding = 'hexa';
  private readonly _input: HTMLTextAreaElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
    this._input = this.shadowRoot?.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;

    this._input.onkeydown = ev => {
      if (ev.ctrlKey) return;
      if (
        ['Backspace', 'Delete', 'Tab', 'Home', 'End', 'Enter'].includes(ev.key)
      )
        return;
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
      this.value = ev.clipboardData?.getData('text') ?? '';
    };
  }

  static get observedAttributes(): string[] {
    return ['placeholder', 'disabled', 'rows', 'cols'];
  }

  connectedCallback(): void {
    if (this.hasAttribute('placeholder')) {
      this._input.placeholder = this.getAttribute('placeholder') as string;
    }

    this._input.disabled = this.hasAttribute('disabled');
  }

  set placeholder(name: string) {
    this._input.placeholder = name;
    this.setAttribute('placeholder', name);
  }

  get placeholder(): string {
    return this._input.placeholder;
  }

  get disabled(): boolean {
    return this._input.disabled;
  }

  set disabled(disable: boolean) {
    this._input.disabled = disable;
    if (disable) this.setAttribute('disabled', 'true');
    else this.removeAttribute('disabled');
  }

  set rows(r: number) {
    this._input.setAttribute('rows', r.toString());
  }

  get rows(): number {
    return this._input.rows;
  }

  set cols(c: number) {
    this._input.setAttribute('cols', c.toString());
  }

  get cols(): number {
    return this._input.cols;
  }

  public override focus(): void {
    this._input.focus();
  }

  attributeChangedCallback(attr: string, oldVal: string, newVal: string): void {
    if (oldVal === newVal) return;
    switch (attr) {
      case 'placeholder':
        this.placeholder = newVal;
        break;
      case 'disabled':
        this.disabled = newVal !== null;
        break;
      case 'rows':
        this.rows = +newVal;
        break;
      case 'cols':
        this.cols = +newVal;
        break;
    }
  }

  set value(v: string) {
    this._input.value = v
      .split('\n')
      .map(s => {
        s = clear_string(s, this._encode);
        return format(split(s, this._encode), this._encode, {
          separator: ' ',
          pad: '0',
        });
      })
      .join('\n');
  }

  get value(): string {
    return this._input.value;
  }

  set data(d: Uint8Array) {
    this._input.value = format(to_array_string(d, this._encode), this._encode, {
      separator: ' ',
      pad: '0',
    });
  }

  get data(): Uint8Array {
    return to_data(split(this.value, this._encode), this._encode);
  }

  get data_array(): Uint8Array[] {
    return this._input.value
      .split('\n')
      .map(s => to_data(split(s, this._encode), this._encode));
  }

  set encode(enc: Encoding) {
    check_encoding(enc);
    if (enc === this._encode) return;
    this._input.value = this._input.value
      .split('\n')
      .map(s =>
        format(convert(split(s, this._encode), this._encode, enc), enc, {
          separator: ' ',
          pad: '0',
        })
      )
      .join('\n');

    this._encode = enc;
  }

  get encode(): Encoding {
    return this._encode;
  }

  public clear(): void {
    this._input.value = '';
  }

  private format(str: string): void {
    this._input.value = str
      .split('\n')
      .map(s => {
        return format(split(s, this._encode), this._encode);
      })
      .join('\n');
  }
}

customElements.define('text-area-binary', BinaryAreaInput);
