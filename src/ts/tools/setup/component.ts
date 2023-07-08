import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <div>
    <button class=delete-db>Erase DB</button>
  </div>
  <div class=info></div>
  <div>
    <small>Version: <b>${__COMMIT_HASH__}</b></small>
  </div>`;
  return template;
})();

function make_setup(): HTMLElement {
  const body = document.createElement('div');
  body.appendChild(template.content.cloneNode(true));
  body.classList.add('setup-body');
  return body;
}

export class SetupComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.rootHtmlElement.appendChild(make_setup());

    this.container.setTitle('Setup');
    if (this.container.layoutManager.isSubWindow)
      window.document.title = 'Setup';
  }
}
