import { ComponentBase } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import type { Encoding } from '../../libs/binary-dump';
import {
  InputDump,
  type InputDumpOptions,
} from '../../web-components/input-dump/input-dump';

export class InputDockDumpComponent extends ComponentBase {
  private readonly _input_dump: InputDump;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Input Dump';
    this._input_dump = new InputDump(state as InputDumpOptions);

    this.rootHtmlElement.appendChild(this._input_dump);
    this._input_dump.addEventListener('state', ev => {
      this._input_dump.state = (ev as CustomEvent).detail;
      window.console_app.set_tool_state(
        'input_dump',
        this._input_dump.state,
        true
      );
    });

    this.container.stateRequestEvent = () => this._input_dump.state;

    this._input_dump.addEventListener('get-link', ev => {
      const link = make_link(
        this.container.componentType as string,
        (ev as CustomEvent).detail as InputDumpOptions,
        true
      );
      navigator.clipboard.writeText(link).finally(() => {});
    });
  }
}

function make_link(
  name: string,
  state: InputDumpOptions,
  fulllink = true
): string {
  let link = `${fulllink ? window.location.origin : ''}${
    window.location.pathname
  }?tool=${name}&encode=${state.encode as Encoding}&bl=${
    state.breakline as number
  }`;

  if (state.hide !== undefined && state.hide.length > 0)
    link += `&hide=${state.hide.join(',')}`;
  if (state.data !== undefined && state.data?.length > 0)
    link += `&data=${state.data}`;

  return link;
}
