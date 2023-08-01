import './text-area-binary';

import { type Encoding, encoding } from '../../libs/binary-dump';
import type { BinaryAreaInput } from './text-area-binary';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  :host {
    display: inline-flex;
  }

  #data {
    flex-grow: 1;
  }

  #encode-container {
    display: inline-flex;
    flex-direction: column;
    vertical-align: top;
  }
  </style>
  <text-area-binary id=data rows=6></text-area-binary>
  <div id=encode-container></div>`;

  return template;
})();

interface BinaryInputAreaSelectOptions {
  selected?: Encoding;
}

export class BinaryInputAreaRadio extends HTMLElement {
  private readonly _data: BinaryAreaInput;

  constructor(options: BinaryInputAreaSelectOptions = {}) {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    this._data = this.shadowRoot?.querySelector('#data') as BinaryAreaInput;
    const encode_container = this.shadowRoot?.querySelector(
      '#encode-container'
    ) as HTMLDivElement;

    encoding.forEach(enc => {
      const input = document.createElement('input');
      input.value = enc;
      input.textContent = enc;
      input.type = 'radio';

      input.onchange = () => {
        this.encode = input.value as Encoding;
      };

      const label = document.createElement('label');
      label.appendChild(input);
      label.appendChild(document.createTextNode(enc));

      encode_container.appendChild(label);
    });

    this.encode = options?.selected ?? 'text';
  }

  static get observedAttributes(): string[] {
    return ['selected', 'placeholder', 'disabled', 'rows', 'cols'];
  }

  connectedCallback(): void {
    if (this.hasAttribute('selected')) {
      this.encode = this.getAttribute('selected') as Encoding;
    }
    if (this.hasAttribute('placeholder')) {
      this._data.placeholder = this.getAttribute('placeholder') as string;
    }
    this.disabled = this.hasAttribute('disabled');
  }

  attributeChangedCallback(attr: string, oldVal: string, newVal: string): void {
    if (oldVal === newVal) return;
    switch (attr) {
      case 'selected':
        this.encode = newVal as Encoding;
        break;
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

  get rows(): number {
    return this._data.rows;
  }

  set rows(r: number) {
    this._data.rows = r;
  }

  get cols(): number {
    return this._data.rows;
  }

  set cols(c: number) {
    this._data.cols = c;
  }

  get value(): string {
    return this._data.value;
  }

  get data(): Uint8Array {
    return this._data.data;
  }

  set data(d: Uint8Array) {
    this._data.data = d;
  }

  get data_array(): Uint8Array[] {
    return this._data.data_array;
  }

  set encode(enc: Encoding) {
    if (!encoding.includes(enc)) return;
    this._data.encode = enc;
    this.shadowRoot?.querySelectorAll('[type=radio]').forEach(e => {
      const ee = e as HTMLInputElement;
      ee.checked = ee.value === enc;
    });
    this.setAttribute('selected', enc);
  }

  get encode(): Encoding {
    return this._data.encode;
  }

  public clear(): void {
    this._data.clear();
  }

  set placeholder(name: string) {
    this._data.placeholder = name;
    this.setAttribute('placeholder', name);
  }

  get placeholder(): string {
    return this._data.placeholder;
  }

  get disabled(): boolean {
    return this._data.disabled;
  }

  set disabled(disable: boolean) {
    this._data.disabled = disable;
    this.shadowRoot?.querySelectorAll('[type=radio]').forEach(e => {
      (e as HTMLInputElement).disabled = disable;
    });
    if (disable) this.setAttribute('disabled', 'true');
    else this.removeAttribute('disabled');
  }

  public override focus(): void {
    this._data.focus();
  }
}

customElements.define('text-area-radio-binary', BinaryInputAreaRadio);
