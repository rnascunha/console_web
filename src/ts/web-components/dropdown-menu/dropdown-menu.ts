const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      position: relative;
      display: inline-block;
    }

    :host(:hover) #content {
      display: flex;
    }

    #content {
      display: none;
      flex-direction: column;
      align-items: center;
      position: absolute;
      z-index: 20;
      background-color: inherit;
      border-radius: 0 0 10px 10px;
    }

  </style>
  <div id=dropdown>
    <slot name=menu></slot>
  </div>
  <div id=content>
    <slot></slot>
  </div>`;
  return template;
})();

export class DropdownMenu extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('dropdown-menu', DropdownMenu);
