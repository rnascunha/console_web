const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      background-color: lightgreen;
      padding: 5px;
      border-radius: 10px;
      min-width: 200px;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
    }

    #message {
      text-align: center;
      width: 100%;
      display: inline-block;
    }

    #close {
      cursor: pointer;
    }

    #close:hover {
      background-color: black;
      color: white;
    }
  </style>
  <slot id=message></slot>
  <span id=close>&#10006;</span>`;
  return template;
})();

export class AlertMessage extends HTMLElement {
  constructor(message: string = '') {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    if (message.length > 0)
      (this.shadowRoot?.querySelector('#message') as HTMLElement).textContent =
        message;

    this.shadowRoot?.querySelector('#close')?.addEventListener('click', () => {
      this.close();
    });
  }

  public close(): void {
    this.parentNode?.removeChild(this);
  }
}

customElements.define('fade-message', AlertMessage);
