import { fade_out } from '../../helper/fade';

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
      font-size: medium;
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
      border-radius: 10px;
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
  constructor(
    message: string = '',
    action: (args: AlertMessage) => any = arg => {
      arg.close();
    }
  ) {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    if (message.length > 0)
      (this.shadowRoot?.querySelector('#message') as HTMLElement).textContent =
        message;

    this.shadowRoot?.querySelector('#close')?.addEventListener('click', () => {
      action(this);
    });
  }

  public text(message: string): AlertMessage {
    (this.shadowRoot?.querySelector('#message') as HTMLElement).textContent =
      message;
    return this;
  }

  public hide(): AlertMessage {
    this.style.visibility = 'hidden';
    return this;
  }

  public show(): AlertMessage {
    this.style.visibility = 'visible';
    return this;
  }

  public close(): void {
    this.parentNode?.removeChild(this);
  }

  public bottom(pixels: number = 5): AlertMessage {
    this.style.top = 'unset';
    this.style.bottom = `${pixels}px`;
    return this;
  }

  public append_element(el: HTMLElement = document.body): AlertMessage {
    el.appendChild(this);
    return this;
  }

  public face_out(pace: number, close = false): AlertMessage {
    fade_out(this, pace)
      .then(() => {
        if (close) this.close();
      })
      .finally(() => {});
    return this;
  }
}

customElements.define('fade-message', AlertMessage);
