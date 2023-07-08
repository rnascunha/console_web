import { ComponentBase } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import {
  InputDump,
  type InputDumpOptions,
} from '../../web-components/input-dump/input-dump';

export class InputDockDumpComponent extends ComponentBase {
  private _state: Record<string, any>;
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._state = JSON.parse(state as string);

    this.container.setTitle('Input Dump');
    if (this.container.layoutManager.isSubWindow)
      window.document.title = 'Input Dump';

    const body = new InputDump(this._state as InputDumpOptions);

    this.rootHtmlElement.appendChild(body);
    body.addEventListener('state', ev => {
      this._state = (ev as CustomEvent).detail;
      window.console_app.set_tool_state('input_dump', this._state, true);
    });

    this.container.stateRequestEvent = () => JSON.stringify(this._state);
  }
}
