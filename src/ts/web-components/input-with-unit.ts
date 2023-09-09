const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        width: 180px;
        display: inline-flex;
        border: 1px solid rgb(118, 118, 118);
        padding: 1px 2px;
        border-radius: 2px;
        background-color: white;
        align-items: center;
      }

      :host(:focus) {
        outline: 1px solid black;
      }

      :host([disabled]) {
        background-color: rgba(239, 239, 239, 0.3);
        color: rgb(84, 84, 84);
        user-select: none;
        border-color: rgba(118, 118, 118, 0.3);
      }

      input {
        width: 0;
        outline: none;
        border: none;
        padding: 0;
        margin: 0;
        flex: 1 1 0;
      }

      span {
        color: rgb(118, 118, 118);
        padding: 0;
        margin: 0;
        flex: 0 0 0;
        font-size: small;
      }
    </style>
    <input>
    <span>unit</span>
  `;
  return template;
})();

export class InputWithUnit extends HTMLElement {
  private readonly _input: HTMLInputElement;
  private readonly _unit: HTMLElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._input = shadow.querySelector('input') as HTMLInputElement;
    this._unit = shadow.querySelector('span') as HTMLElement;
  }

  public connectedCallback(): void {
    ['type', 'value', 'min', 'max', 'step', 'placeholder', 'disabled'].forEach(
      val => {
        if (this.hasAttribute(val))
          this._input.setAttribute(
            val,
            this.getAttribute(val) !== null
              ? (this.getAttribute(val) as string)
              : ''
          );
      }
    );

    if (this.hasAttribute('unit'))
      this._unit.textContent = this.getAttribute('unit');
  }

  get value(): string {
    return this._input.value;
  }

  set value(data: string) {
    this._input.setAttribute('value', data);
    // this._input.value = data;
  }

  get unit(): string | null {
    return this._unit.textContent;
  }

  set unit(data: string) {
    this._unit.textContent = data;
  }
}

customElements.define('input-with-unit', InputWithUnit);
