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
import * as monaco from 'monaco-editor';

import style from '../../../css/golden-layout.less';

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
        hasHeaders: false,
        componentState: {
          value: '{"test": 1, "icon": "my icon"}',
          language: 'json',
          // theme: 'vs-dark',
        },
        id: 'editor',
      },
      {
        type: ItemType.component,
        componentType: 'MarkersComponent',
        header: {
          popout: false,
        },
        size: '30%',
        id: 'markers',
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

    this._layout.loadLayout(layout_config);
    const editor = (
      this._layout.findFirstComponentItemById('editor')
        ?.component as MonacoComponent
    ).editor;
    const markers = this._layout.findFirstComponentItemById('markers')
      ?.component as MarkersComponent;

    monaco.editor.onDidChangeMarkers(() => {
      const ms = monaco.editor.getModelMarkers({
        resource: editor.getModel()?.uri,
      });
      markers.update(ms);
    });
  }
}
