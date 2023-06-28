import { type Encoding, encoding } from '../../libs/binary-dump';
import type { BinaryInput } from './text-binary';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  :host {
    display: inline-block;
  }
  </style>
  <text-binary id=data></text-binary>
  <select id=encode></select>`;

  return template;
})();

interface BinaryInputSelectOptions {
  selected?: Encoding;
}

export class BinaryInputSelect extends HTMLElement {
  private readonly _data: BinaryInput;
  private readonly _select: HTMLSelectElement;

  constructor(options: BinaryInputSelectOptions = {}) {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    this._data = this.shadowRoot?.querySelector('#data') as BinaryInput;
    this._select = this.shadowRoot?.querySelector(
      '#encode'
    ) as HTMLSelectElement;
    encoding.forEach(enc => {
      this._select.appendChild(
        new Option(enc, enc, false, options?.selected === enc)
      );
    });

    this.encode = options?.selected ?? (this._select.value as Encoding);
    this._select.onchange = ev => {
      this.encode = this._select.value as Encoding;
    };
  }

  static get observedAttributes(): string[] {
    return ['selected', 'placeholder', 'disabled'];
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
    }
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

  set encode(enc: Encoding) {
    if (!encoding.includes(enc)) return;
    this._data.encode = enc;
    this._select.value = enc;
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
    this._select.disabled = disable;
    if (disable) this.setAttribute('disabled', 'true');
    else this.removeAttribute('disabled');
  }

  public override focus(): void {
    this._data.focus();
  }
}

customElements.define('text-select-binary', BinaryInputSelect);
