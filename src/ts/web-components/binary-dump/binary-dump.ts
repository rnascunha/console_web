import { base64_encode } from '../../libs/base64';
import {
  is_ascii_code_printable,
  to_array_string,
  type Encoding,
  encoding,
} from '../../libs/binary-dump';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        width: fit-content;
        overflow: hidden;
        display: grid;
        grid-template: 
          "line binary octal decimal hexa text"
          "base64 base64 base64 base64 base64 base64 " / 
          auto auto auto auto auto auto
      }
      
      .field {
        padding: 4px;
        margin: 0px;
      }

      #line-count {
        background-color: white;
        grid-area: line;
      }

      #decimal {
        background-color: yellow;
        grid-area: decimal;
      }
      
      #hexa {
        background-color: blue;
        grid-area: hexa;
      }

      #text {
        background-color: red;
        grid-area: text;
      }

      #binary {
        background-color: grey;
        grid-area: binary;
      }

      #octal {
        background-color: green;
        grid-area: octal;
      }

      #base64-container {
        background-color: lightgray;
        grid-area: base64;
        display: flex;
        align-items: center;
      }

      #base64 {
        margin: 0;
        width: min-content;
        line-break: anywhere;
        white-space: break-spaces;
        flex-grow: 1;
      }

      .hovered {
        background-color: rgba(138, 43, 226, 0.6);
        font-weight: bold;
        border-radius: 8px;
      }
      
      .selected {
        background-color: rgba(255, 127, 80, 0.6);
        font-weight: bold;
        border-radius: 8px;
      }
      
      #decimal span[data-value],
      #octal span[data-value],
      #hexa span[data-value],
      #binary span[data-value] {
        padding: 2px 4px;
      }
    </style>
    <pre id="line-count" class="field"></pre>
    <pre id="binary" class="field"></pre>
    <pre id="octal" class="field"></pre>
    <pre id="decimal" class="field"></pre>
    <pre id="hexa" class="field"></pre>
    <pre id="text" class="field"></pre>
    <div id=base64-container>
      <slot name=base64-label><b>Base 64: </b></slot>
      <pre id=base64></pre>
    </div>`;
  return template;
})();

export class BinaryDump extends HTMLElement {
  private readonly _decimal: HTMLPreElement;
  private readonly _hexa: HTMLPreElement;
  private readonly _octal: HTMLPreElement;
  private readonly _binary: HTMLPreElement;
  private readonly _text: HTMLPreElement;
  private readonly _base64: HTMLPreElement;
  private readonly _lc: HTMLPreElement;

  private _bl: number;

  private readonly _hide: Set<Encoding>;

  constructor(
    bl: number = 16,
    data?: Uint8Array,
    option?: { hide: Encoding[] }
  ) {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    this._hide = new Set<Encoding>(option?.hide);

    this._binary = this.shadowRoot?.querySelector('#binary') as HTMLPreElement;
    this._octal = this.shadowRoot?.querySelector('#octal') as HTMLPreElement;
    this._decimal = this.shadowRoot?.querySelector(
      '#decimal'
    ) as HTMLPreElement;
    this._hexa = this.shadowRoot?.querySelector('#hexa') as HTMLPreElement;
    this._text = this.shadowRoot?.querySelector('#text') as HTMLPreElement;
    this._base64 = this.shadowRoot?.querySelector('#base64') as HTMLPreElement;
    this._lc = this.shadowRoot?.querySelector('#line-count') as HTMLPreElement;

    this._bl = bl;

    this.shadowRoot?.addEventListener('mouseover', ev => {
      const el = ev.target as HTMLElement;
      if ('value' in el.dataset) {
        this.shadowRoot
          ?.querySelectorAll(`[data-value='${el.dataset.value}']`) // eslint-disable-line
          .forEach(e => {
            e.classList.add('hovered');
          });
        this.shadowRoot
          ?.querySelectorAll(`[data-idx='${el.dataset.idx}']`) // eslint-disable-line
          .forEach(e => {
            e.classList.add('selected');
          });
      }
    });

    this.shadowRoot?.addEventListener('mouseout', ev => {
      const el = ev.target as HTMLElement;
      if ('value' in el.dataset) {
        this.shadowRoot
          ?.querySelectorAll(`[data-value='${el.dataset.value}']`) // eslint-disable-line
          .forEach(e => {
            e.classList.remove('hovered');
          });
        this.shadowRoot
          ?.querySelectorAll(`[data-idx='${el.dataset.idx}']`) // eslint-disable-line
          .forEach(e => {
            e.classList.remove('selected');
          });
      }
    });

    if (data !== undefined) this.update(data);

    this.set_hide();
  }

  connectedCallback(): void {
    if (this.hasAttribute('hide'))
      this.hide(...(this.getAttribute('hide')?.split(',') as Encoding[]));
  }

  attributeChangedCallback(attr: string, oldVal: string, newVal: string): void {
    if (oldVal === newVal) return;
    this._hide.clear();
    this.hide(...(newVal.split(',') as Encoding[]));
  }

  static get observedAttributes(): string[] {
    return ['hide'];
  }

  get hided(): Encoding[] {
    return Array.from(this._hide.values());
  }

  hide(...args: Encoding[]): void {
    let changed: boolean = false;
    args.forEach((s: Encoding) => {
      if (is_encoding(s) && !this._hide.has(s)) {
        changed = true;
        this._hide.add(s);
      }
    });

    if (changed) this.set_hide();
  }

  show(...args: Encoding[]): void {
    let changed: boolean = false;
    args.forEach((s: Encoding) => {
      if (is_encoding(s) && this._hide.has(s)) {
        changed = true;
        this._hide.delete(s);
      }
    });

    if (changed) this.set_hide();
  }

  is_hidden(encode: Encoding): boolean {
    return this._hide.has(encode);
  }

  public update(data: Uint8Array, bl: number = this._bl): void {
    this._bl = bl;

    [
      [this._binary, 'binary'],
      [this._decimal, 'decimal'],
      [this._octal, 'octal'],
      [this._hexa, 'hexa'],
    ].forEach(v => {
      this.append_elements(
        v[0] as HTMLElement,
        break_line_array(
          to_binary_array_element(
            data,
            to_array_string(data, v[1] as Encoding, '0')
          ),
          this._bl
        )
      );
    });
    this.append_elements(
      this._text,
      break_line_array(
        to_binary_array_element(data, binary_to_ascii(data)),
        this._bl
      )
    );
    this._base64.textContent = base64_encode(data, { breakline: false });
    create_break_line_field(this._lc, data.length, this._bl);
  }

  private append_elements(
    container: HTMLElement,
    elements: HTMLSpanElement[]
  ): void {
    container.innerHTML = '';
    elements.forEach(el => container.appendChild(el));
  }

  private set_hide(): void {
    const new_value: Encoding[] = [];
    [
      [this._binary, 'binary'],
      [this._decimal, 'decimal'],
      [this._hexa, 'hexa'],
      [this._octal, 'octal'],
      [this._text, 'text'],
    ].forEach(v => {
      if (this._hide.has(v[1] as Encoding)) {
        (v[0] as HTMLElement).style.display = 'none';
        new_value.push(v[1] as Encoding);
      } else (v[0] as HTMLElement).style.display = '';
    });

    {
      // Base64
      const el = this.shadowRoot?.querySelector(
        '#base64-container'
      ) as HTMLElement;
      if (this._hide.has('base64')) {
        new_value.push('base64');
        el.style.display = 'none';
      } else el.style.display = '';
    }

    this.setAttribute('hide', new_value.join(','));
  }
}

function is_encoding(encode: Encoding): boolean {
  return encoding.includes(encode);
}

customElements.define('binary-dump', BinaryDump);

/**
 * Free functions
 */

function binary_to_ascii(data: Uint8Array): string[] {
  return data.reduce<string[]>((acc, v) => {
    acc.push(!is_ascii_code_printable(v) ? '.' : String.fromCharCode(v));
    return acc;
  }, []);
}

function to_binary_array_element(
  data: Uint8Array,
  value: string[]
): HTMLSpanElement[] {
  const out: HTMLSpanElement[] = [];
  data.forEach((v, i) => {
    const s = document.createElement('span');
    s.dataset.value = v.toString(10);
    s.dataset.idx = i.toString(10);
    s.textContent = value[i];
    out.push(s);
  });
  return out;
}

function break_line_array(
  els: HTMLSpanElement[],
  br: number
): HTMLSpanElement[] {
  /**
   * TODO: Add a assert that BR must be positive integer
   */
  return els.reduce<HTMLSpanElement[]>((acc, v, idx) => {
    if (idx !== 0 && idx % br === 0) acc.push(document.createElement('br'));
    acc.push(v);
    return acc;
  }, []);
}

function create_break_line_field(
  el: HTMLElement,
  lines: number,
  br: number
): void {
  el.innerHTML = '';
  let i = 0;
  while (true) {
    const span = document.createElement('span');
    span.textContent = i.toString(16).padStart(4, '0');
    el.appendChild(span);
    i += br;
    if (i >= lines) break;
    el.appendChild(document.createElement('br'));
  }
}
