import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';

import style from 'monaco-editor/min/vs/editor/editor.main.css' assert { type: 'css' };

import * as monaco from 'monaco-editor';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  :host {
    overflow: hidden;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  </style>
  <div id=container></div>`;
  return template;
})();

export class CoderComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Coder';

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [style];
    shadow.appendChild(template.content.cloneNode(true));

    container.on('open', () => {
      this.init();
    });
  }

  private init(): void {
    const content = this.rootHtmlElement.shadowRoot?.querySelector(
      '#container'
    ) as HTMLElement;
    const editor = monaco.editor.create(content, {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join(
        '\n'
      ),
      language: 'javascript',
    });
    this.container.on('resize', () => {
      editor.layout();
    });
  }
}
