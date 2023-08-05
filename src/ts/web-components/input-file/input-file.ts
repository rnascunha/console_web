const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      position: relative;
      --cursor-input: auto;
    }

    ::slotted(*) {
      cursor: var(--cursor-input);
    }

    input {
      position: absolute;
      top: -10000px;
      left: 0;
    }
  </style><label><slot></slot><input type=file /></label>`;

  return template;
})();

class InputFile extends HTMLElement {
  private readonly _input: HTMLInputElement;
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
    this._input = this.shadowRoot?.querySelector('input') as HTMLInputElement;
  }

  public connectedCallback(): void {
    if (this.hasAttribute('accept'))
      this._input.setAttribute('accept', this.getAttribute('accept') as string);

    if (this.hasAttribute('multiple'))
      this._input.setAttribute(
        'multiple',
        this.getAttribute('multiple') as string
      );

    if (this.hasAttribute('webkitdirectory'))
      this._input.setAttribute('webkitdirectory', '');
  }

  get value(): string {
    return this._input.value;
  }

  set value(val: string) {
    this._input.value = val;
  }

  get files(): FileList | null {
    return this._input.files;
  }

  public on(
    type: string,
    listener: (params: Event) => any,
    options: EventListenerOptions = {}
  ): void {
    this._input.addEventListener(type, listener, options);
  }
}

customElements.define('input-file', InputFile);
