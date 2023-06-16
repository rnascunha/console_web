import * as encode from '../../helper/encode';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        width: fit-content;
        overflow: hidden;
        display: grid;
        grid-template: ". . . . ."
      }
      
      .field {
        padding: 4px;
        margin: 0px;
      }

      #line-count {
        background-color: white;
      }

      #decimal {
        background-color: yellow;
      }
      
      #hexa {
        background-color: blue;
      }

      #char {
        background-color: red;
      }

      #octal {
        background-color: green;
      }

      .hovered {
        background-color: blueviolet;
        font-weight: bold;
        border-radius: 8px;
      }
      
      .selected {
        background-color: coral;
        font-weight: bold;
        border-radius: 8px;
      }
      
      #decimal span[data-value],
      #octal span[data-value],
      #hexa span[data-value] {
        padding: 2px 4px;
      }
    </style>
    <pre id="line-count" class="field"></pre>
    <pre id="decimal" class="field"></pre>
    <pre id="hexa" class="field"></pre>
    <pre id="octal" class="field"></pre>
    <pre id="char" class="field"></pre>`;
  return template;
})();

export class BinaryDump extends HTMLElement {
  private readonly _deci: HTMLPreElement;
  private readonly _hexa: HTMLPreElement;
  private readonly _octal: HTMLPreElement;
  private readonly _char: HTMLPreElement;
  private readonly _lc: HTMLPreElement;

  private _bl: number;

  constructor(bl: number = 16, data?: Uint8Array) {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    this._deci = this.shadowRoot?.querySelector('#decimal') as HTMLPreElement;
    this._hexa = this.shadowRoot?.querySelector('#hexa') as HTMLPreElement;
    this._octal = this.shadowRoot?.querySelector('#octal') as HTMLPreElement;
    this._char = this.shadowRoot?.querySelector('#char') as HTMLPreElement;
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
  }

  public update(data: Uint8Array, bl: number = this._bl): void {
    this._bl = bl;
    this.append_elements(
      this._deci,
      encode.break_line_array(
        encode.to_binary_array_element(data, encode.binary_to_decimal(data)),
        this._bl
      )
    );
    this.append_elements(
      this._hexa,
      encode.break_line_array(
        encode.to_binary_array_element(data, encode.binary_to_hexa(data)),
        this._bl
      )
    );
    this.append_elements(
      this._octal,
      encode.break_line_array(
        encode.to_binary_array_element(data, encode.binary_to_octal(data)),
        this._bl
      )
    );
    this.append_elements(
      this._char,
      encode.break_line_array(
        encode.to_binary_array_element(data, encode.binary_to_ascii(data)),
        this._bl
      )
    );
    encode.create_break_line_field(this._lc, data.length, this._bl);
  }

  private append_elements(
    container: HTMLElement,
    elements: HTMLSpanElement[]
  ): void {
    container.innerHTML = '';
    elements.forEach(el => container.appendChild(el));
  }
}

customElements.define('binary-dump', BinaryDump);
