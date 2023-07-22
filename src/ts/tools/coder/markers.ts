import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';

import * as monaco from 'monaco-editor';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    .marker {
      color: white;
      margin: 0;
      padding: 2px 0px;
    }

    .error {
      background-color: red;
    }

    .warning {
      background-color: yellow;
    }

    .info {
      background-color: lightgreen;
    }

    .hint {
      background-color: black;
    }
  </style>
  <div id=container></div>`;

  return template;
})();

function get_serverity_class(sev: monaco.MarkerSeverity): string {
  switch (sev) {
    case monaco.MarkerSeverity.Error:
      return 'error';
    case monaco.MarkerSeverity.Warning:
      return 'warning';
    case monaco.MarkerSeverity.Info:
      return 'info';
    case monaco.MarkerSeverity.Hint:
      return 'hint';
  }
  return '';
}

export class MarkersComponent extends ComponentBase {
  private readonly _output: HTMLElement;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Problems';

    this.rootHtmlElement.appendChild(template.content.cloneNode(true));
    this._output = this.rootHtmlElement.querySelector(
      '#container'
    ) as HTMLElement;
  }

  public update(markers: monaco.editor.IMarkerData[]): void {
    this._output.innerHTML = '';
    if (markers.length === 0) return;

    markers.forEach(m => {
      const pre = document.createElement('pre');
      pre.classList.add('marker', get_serverity_class(m.severity));
      pre.textContent = `${m.startLineNumber}:${m.startColumn}-${m.endLineNumber}:${m.endColumn} ${m.message}`;
      this._output.appendChild(pre);
    });
  }
}
