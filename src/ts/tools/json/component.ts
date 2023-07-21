import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';

import style from 'monaco-editor/min/vs/editor/editor.main.css' assert { type: 'css' };

import * as monaco from 'monaco-editor';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  :host {
    overflow: auto;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  #header {
    display: grid;
    grid-template-columns: min-content min-content min-content min-content min-content auto min-content;
    grid-column-gap: 2px;
    align-items: center;
  }

  #theme-sel {
    justify-self: end;
  }

  #container {
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #indent-in {
    width: 5ch;
  }

  #error {
    background-color: red;
    color: white;
    font-weight: bold;
    padding: 0px 3px;
    border-radius: 3px;
  }

  #error:empty {
    display: none;
  }

  #error-container {
    display: block;
    height: 100px;
    background-color: green;
  }

  </style>
  <div id=header>
    <button id=indent-btn>Indent</button>
    <button id=minify-btn>Minify</button>
    <button id=clear-btn>Clear</button>
    <input type=number min=0 max=10 id=indent-in value=0 />
    <button id=copy-btn>Copy</button>
    <div><span id=error></span></div>
    <select id=theme-sel>
      <option value=vs>vs</option>
      <option value=vs-dark>vs-dark</option>
      <option value=hc-light>hc-light</option>
      <option value=hc-black>hc-black</option>
    </select>
  </div>
  <div id=container></div>`;
  return template;
})();

export class JSONComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'JSON';

    console.log(this.container.initialState);

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.adoptedStyleSheets = [style];
    shadow.appendChild(template.content.cloneNode(true));

    container.on('open', () => {
      this.init();
    });
  }

  private init(): void {
    console.log(this.container.parent.headerConfig);

    const shadow = this.rootHtmlElement.shadowRoot as ShadowRoot;
    const content = shadow.querySelector('#container') as HTMLElement;
    const error = shadow.querySelector('#error') as HTMLElement;
    error.textContent = '';

    const editor = monaco.editor.create(content, {
      value: '{"test": 1, "icon": "my icon"}',
      language: 'json',
      // scrollBeyondLastLine: false,
      // wrappingIndent: 'indent',
      // autoIndent: 'full',
      // formatOnPaste: true,
      // formatOnType: true,
    });

    this.container.on('resize', () => {
      editor.layout();
    });

    // console.log(
    //   editor.getId(),
    //   editor.getModel()?.id,
    //   editor.getModel()?.getLanguageId(),
    //   editor.getModel()?.getVersionId(),
    //   editor.getModel()?.uri
    // );
    // monaco.editor.setModelMarkers()

    // const el = document.createElement('div');
    // el.textContent = 'My banner';
    // el.style.backgroundColor = 'green';
    // el.style.width = '100px';
    // el.style.height = '100px';
    // editor.setBanner(el, 10);

    // Indent
    (shadow.querySelector('#indent-btn') as HTMLElement).addEventListener(
      'click',
      () => {
        editor
          .getAction('editor.action.formatDocument')
          ?.run()
          .finally(() => {});
      }
    );

    // Minify
    (shadow.querySelector('#minify-btn') as HTMLElement).addEventListener(
      'click',
      () => {
        // editor.setValue(JSON.stringify(editor.getValue(), undefined, 0));
        editor.updateOptions({
          wrappingIndent: 'none',
        });
      }
    );
    // Clear
    (shadow.querySelector('#clear-btn') as HTMLElement).addEventListener(
      'click',
      () => {
        editor.setValue('');
      }
    );
    // Copy
    const indent = shadow.querySelector('#indent-in') as HTMLInputElement;
    const copy = shadow.querySelector('#copy-btn') as HTMLButtonElement;
    copy.addEventListener('click', () => {
      error.textContent = '';
      const errs = monaco.editor.getModelMarkers({});
      if (errs.length > 0) {
        error.textContent = 'Error';
        return;
      }
      try {
        navigator.clipboard
          .writeText(
            JSON.stringify(
              JSON.parse(editor.getValue()),
              undefined,
              +indent.value
            )
          )
          .finally(() => {});
      } catch (e) {
        error.textContent = 'Parsing error';
      }
    });

    // theme
    const theme = shadow.querySelector('#theme-sel') as HTMLSelectElement;
    theme.addEventListener('change', ev => {
      monaco.editor.setTheme(theme.value);
    });

    // Markers
    monaco.editor.onDidChangeMarkers(uris => {
      const markers = monaco.editor.getModelMarkers({
        resource: editor.getModel()?.uri,
      });
      switch (markers.length) {
        case 0:
          error.textContent = '';
          copy.disabled = false;
          break;
        case 1:
          error.textContent = `Error: ${markers[0].startLineNumber}:${markers[0].startColumn}-${markers[0].endLineNumber}:${markers[0].endColumn} ${markers[0].message}`;
          copy.disabled = true;
          break;
        default:
          error.textContent = `${markers.length} errors found`;
          copy.disabled = true;
          break;
      }
    });
  }
}
