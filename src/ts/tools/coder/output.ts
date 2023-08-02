import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import { roll_to_bottom } from '../../helper/element';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    #output {
      color: white;
      overflow: auto;
      height: 100%;
    }
    
    .time:after {
      content: ': ';
    }
  </style>
  <div id=output></div>`;

  return template;
})();

export class OutputComponent extends ComponentBase {
  private readonly _output: HTMLElement;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Output';

    this.rootHtmlElement.appendChild(template.content.cloneNode(true));
    this._output = this.rootHtmlElement.querySelector('#output') as HTMLElement;
  }

  public update(out: string): void {
    const pre = document.createElement('pre');

    const time = document.createElement('span');
    time.classList.add('time');
    time.textContent = Date.now().toString();
    pre.appendChild(time);

    const output = document.createElement('span');
    output.textContent = out;
    pre.appendChild(output);

    this._output.appendChild(pre);

    roll_to_bottom(this._output);
  }
}
