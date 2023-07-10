import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../golden-components/component-base';

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
