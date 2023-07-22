import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ComponentBase } from './component-base';
import * as monaco from 'monaco-editor';

import monaco_style from 'monaco-editor/min/vs/editor/editor.main.css';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      height: 100%;
    }

    #editor {
      height: 100%;
    }
  </style>
  <div id=editor></div>`;
  return template;
})();

export class MonacoComponent extends ComponentBase {
  private readonly _editor: monaco.editor.IStandaloneCodeEditor;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Editor';

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [monaco_style];
    shadow.appendChild(template.content.cloneNode(true));
    const editor_el = shadow.querySelector('#editor') as HTMLElement;

    this._editor = monaco.editor.create(
      editor_el,
      state as monaco.editor.IStandaloneEditorConstructionOptions
    );

    this.container.on('resize', () => {
      this._editor.layout();
    });

    // Is this needed?
    this.container.on('open', () => {
      this._editor.layout();
    });
  }

  get editor(): monaco.editor.IStandaloneCodeEditor {
    return this._editor;
  }
}
