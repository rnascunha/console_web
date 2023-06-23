export class App {
  private readonly _proto;
  private readonly _el;
  private readonly _component;

  constructor(protocol: string, el: HTMLElement, component: any) {
    this._proto = protocol;
    this._el = el;
    this._component = component;
  }

  get protocol(): string {
    return this._proto;
  }

  get element(): HTMLElement {
    return this._el;
  }

  get component(): any {
    return this._component;
  }
}

const serial_template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<div id="serial-container">
    <select id="sel-serial-port"></select>
    <button id="serial-request">&#128279;</button>
  </div>`;
  return template;
})();

const url_template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<div id="serial-container">
    <select id="sel-serial-port"></select>
    <button id="serial-request">&#128279;</button>
  </div>`;
  return template;
})();
