import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../golden-components/component-base';
import image from '../../../img/github.png';
import type { SetupOptions } from './setup';

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

    legend {
      font-weight: bold;
    }

    fieldset {
      border: 3px solid white;
      border-radius: 5px;
    }

    #coder-theme {
      height: 100%;
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
    <fieldset>
      <legend>Database</legend>
      <button id=delete-db>Erase DB</button>
      <div id=info></div>
    </fieldset>
    <fieldset>
      <legend>Coder</legend>
      <select id=coder-theme>
        <option value=vs>vs</option>
        <option value=vs-dark>vs-dark</option>
        <option value=hc-light>hc-light</option>
        <option value=hc-black>hc-black</option>
      </select>
    </fieldset>
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

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    const opt = state as SetupOptions;
    this.title = 'Setup';

    this._info = shadow.querySelector('#info') as HTMLElement;

    shadow.querySelector('#delete-db')?.addEventListener('click', () => {
      this.rootHtmlElement.dispatchEvent(new Event('delete-db'));
    });

    const coder_theme = shadow.querySelector(
      '#coder-theme'
    ) as HTMLSelectElement;
    if (opt.coder_theme !== undefined) coder_theme.value = opt.coder_theme;
    coder_theme.addEventListener('change', ev => {
      this.rootHtmlElement.dispatchEvent(
        new CustomEvent('coder-theme', {
          detail: coder_theme.value,
          bubbles: true,
        })
      );
    });
  }

  public info(message: string): void {
    this._info.textContent = message;
  }
}
