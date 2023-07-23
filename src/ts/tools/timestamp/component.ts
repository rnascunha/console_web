import { ComponentBase } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { ClockApp } from './clock';
import { TimestampApp } from './timestamp';
import type { TimestampOptions } from './types';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      height: 100%;
      background-color: grey !important;
    }

    select{
      max-width: 25ch;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .clock-body {
      background-color: lightgrey;
      padding: 2px;
      border: 2px solid black;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .clock-header {
      background-color: blue;
      border-radius: 10px 10px 0px 0px;
      font-weight: bold;
    }
  </style>
  <button id=get-link>Link 🔗</button>
  <h2>Clocks</h2>
  <div id=clock-app></div>
  <h2>Timestamps</h2>
  <div id=timestamp-app></div>`;
  return template;
})();

export class TimestampComponent extends ComponentBase {
  private readonly _state: Record<string, any>;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._state = state as TimestampOptions;

    this.rootHtmlElement.style.overflow = 'auto';

    this.title = 'Timestamp';
    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    shadow.querySelector('#get-link')?.addEventListener('click', () => {
      const link = make_link(
        this.container.componentType as string,
        this._state,
        true
      );
      navigator.clipboard.writeText(link).finally(() => {});
    });

    /**
     *
     */
    const clock_app = new ClockApp(
      shadow.querySelector('#clock-app') as HTMLElement,
      this._state.clocks ?? []
    );

    clock_app.on('state', tzs => {
      this._state.clocks = tzs;
      window.console_app.set_tool_state('timestamp', this._state, true);
    });

    const timestamp_app = new TimestampApp(
      shadow.querySelector('#timestamp-app') as HTMLElement,
      this._state.timestamp ?? []
    );

    timestamp_app.on('state', state => {
      this._state.timestamp = state;
      window.console_app.set_tool_state('timestamp', this._state, true);
    });

    this.container.on('beforeComponentRelease', () => {
      clock_app.stop();
    });

    this.container.stateRequestEvent = () => this._state;
  }
}

function make_link(
  name: string,
  state: TimestampOptions,
  fulllink: boolean = true
): string {
  let link = `${fulllink ? window.location.origin : ''}${
    window.location.pathname
  }?tool=${name}`;

  if (state.clocks !== undefined && state.clocks?.length > 0)
    link += `&clocks=${state.clocks.join(',')}`;

  if (state.timestamp !== undefined && state.timestamp?.length > 0)
    link += `&timestamp=${state.timestamp
      .map(v => {
        return `${v.timezone},${v.timestamp}`;
      })
      .join(';')}`;

  return link;
}
