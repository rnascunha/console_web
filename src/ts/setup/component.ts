import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../golden-components/component-base';
import image from '../../../img/github.png';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      background-color: grey !important;
    }

    #github {
      height: 25px;
      width: 25px;
      background-color: white;
      border-radius: 50%;
    }
    
    #footer {
      align-self: flex-end;
    }
  </style>
  <div>
    <button id=delete-db>Erase DB</button>
    <div id=info></div>
  </div>
  <div id=footer>
    <small>Version: <b>${__COMMIT_HASH__}</b></small>
    <a target=_blank href=https://github.com/rnascunha/console_web>
      <img id=github src="${image as string}" alt=GitHub></img>
    </a>
  </div>`;
  return template;
})();

export class SetupComponent extends ComponentBase {
  private readonly _info: HTMLElement;
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.rootHtmlElement.attachShadow({ mode: 'open' });
    this.rootHtmlElement.shadowRoot?.appendChild(
      template.content.cloneNode(true)
    );

    console.log(image);

    this.title = 'Setup';

    this._info = this.rootHtmlElement.shadowRoot?.querySelector(
      '#info'
    ) as HTMLElement;

    this.rootHtmlElement.shadowRoot
      ?.querySelector('#delete-db')
      ?.addEventListener('click', () => {
        this.rootHtmlElement.dispatchEvent(new Event('delete-db'));
      });
  }

  public info(message: string): void {
    this._info.textContent = message;
  }
}
