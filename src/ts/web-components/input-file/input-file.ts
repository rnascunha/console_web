const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      position: relative;
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
