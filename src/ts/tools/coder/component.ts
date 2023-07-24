import {
  GoldenLayout,
  ItemType,
  type ComponentContainer,
  type JsonValue,
  type LayoutConfig,
} from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import { MonacoComponent } from '../../golden-components/monaco';
import { MarkersComponent } from './markers';
import { OutputComponent } from './output';
import type { CoderOptions } from './types';

import * as monaco from 'monaco-editor';

import style from '../../../css/golden-layout.less';
import { base64_encode_string } from '../../libs/base64';

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
    display: flex;
  }

  #container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #menu {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    font-size: x-large;
    color: white;
  }

  .icon {
    padding: 2px 4px;
    border-radius: 4px;
    cursor: pointer;
  }

  .icon:hover {
    background-color: white;
    color: black;
  }

  </style>
  <div id=menu>
    <span id=execute class=icon>&#x25B6;</span>
    <span id=get-link class=icon>&#x1F517;</span>
  </div>
  <div id=container></div>`;
  return template;
})();

const layout_config: LayoutConfig = {
  settings: {
    responsiveMode: 'always',
  },
  root: {
    type: ItemType.column,
    content: [
      {
        type: ItemType.component,
        componentType: 'MonacoComponent',
        isClosable: false,
        componentState: {
          value: '',
          language: 'javascript',
          // theme: 'vs-dark',
        },
        id: 'editor',
      },
      {
        type: ItemType.stack,
        size: '30%',
        isClosable: false,
        header: {
          popout: false,
        },
        content: [
          {
            type: ItemType.component,
            componentType: 'MarkersComponent',
            isClosable: false,
            header: {
              popout: false,
            },
            id: 'markers',
          },
          {
            type: ItemType.component,
            componentType: 'OutputComponent',
            isClosable: false,
            header: {
              popout: false,
            },
            id: 'output',
          },
        ],
      },
    ],
  },
};

export class CoderComponent extends ComponentBase {
  private readonly _layout: GoldenLayout;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Coder';

    const opt = state as CoderOptions;

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    shadow.adoptedStyleSheets = [style];

    const content = shadow.querySelector('#container') as HTMLElement;
    this._layout = new GoldenLayout(content);
    this._layout.resizeWithContainerAutomatically = true;

    this._layout.registerComponentConstructor(
      'MonacoComponent',
      MonacoComponent
    );
    this._layout.registerComponentConstructor(
      'MarkersComponent',
      MarkersComponent
    );
    this._layout.registerComponentConstructor(
      'OutputComponent',
      OutputComponent
    );

    this._layout.loadLayout(layout_config);
    const editor = (
      this._layout.findFirstComponentItemById('editor')
        ?.component as MonacoComponent
    ).editor;
    editor.setValue(opt.value ?? '');

    const markers = this._layout.findFirstComponentItemById('markers')
      ?.component as MarkersComponent;
    const output = this._layout.findFirstComponentItemById('output')
      ?.component as OutputComponent;

    monaco.editor.onDidChangeMarkers(() => {
      const ms = monaco.editor.getModelMarkers({
        resource: editor.getModel()?.uri,
      });
      markers.update(ms);
    });

    editor.onDidChangeModelContent(() => {
      window.console_app.set_tool_state(
        'coder',
        { value: editor.getValue() },
        true
      );
    });

    shadow.querySelector('#execute')?.addEventListener('click', () => {
      output.container.focus();
      try {
        console.log(eval(editor.getValue()));
        output.update('Code run');
      } catch (e) {
        output.update((e as Error).message);
      }
    });

    shadow.querySelector('#get-link')?.addEventListener('click', () => {
      navigator.clipboard
        .writeText(make_link('coder', { value: editor.getValue() }, true))
        .finally(() => {});
    });
  }
}

function make_link(
  name: string,
  state: CoderOptions,
  fulllink: boolean = true
): string {
  let link = `${fulllink ? window.location.origin : ''}${
    window.location.pathname
  }?tool=${name}`;

  if (state.value !== undefined && state.value.length > 0)
    link += `&value=${base64_encode_string(state.value)}`;

  return link;
}
