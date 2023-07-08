const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      position: relative;
      border: 1px solid black;
      border-radius: 3px;
      box-sizing: border-box;
    }

    input {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0;
      box-sizing: border-box;
    }
  </style><slot></slot>
  <input type=file />`;

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

  public on(
    type: string,
    listener: (params: Event) => any,
    options: EventListenerOptions = {}
  ): void {
    this._input.addEventListener(type, listener, options);
  }
}

customElements.define('input-file', InputFile);
