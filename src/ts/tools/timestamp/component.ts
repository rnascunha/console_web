import { ComponentBase } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { timeZones } from '../../helper/timezone';
import { ClockApp } from './clock';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      height: 100%;
      background-color: grey !important;
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
  <div id=clock-app></div>
  <br>
  <div>
    <input type="datetime-local" id=datetime />
    <button id=submit-date>Add</button>
    <div id=output></div>
  </div>
  <div>
    <input type=number min=0 id=timestamp />
    <div id=output-date></div>
  </div>
  <div>
    <select id=timezones></select>
  </div>
  `;
  return template;
})();

export class TimestampComponent extends ComponentBase {
  private _state: Record<string, any>;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._state = JSON.parse(state as string);

    this.title = 'Timestamp';
    this.rootHtmlElement.attachShadow({ mode: 'open' });
    this.rootHtmlElement.shadowRoot?.appendChild(
      template.content.cloneNode(true)
    );

    /**
     *
     */
    const clock_app = new ClockApp(
      this.rootHtmlElement.shadowRoot?.querySelector(
        '#clock-app'
      ) as HTMLElement,
      this._state.clocks ?? []
    );

    clock_app.on('state', tzs => {
      this._state.clocks = tzs;
      window.console_app.set_tool_state('timestamp', this._state, true);
    });

    this.container.on('beforeComponentRelease', () => {
      clock_app.stop();
    });

    /**
     *
     */
    const input = this.rootHtmlElement.shadowRoot?.querySelector(
      '#datetime'
    ) as HTMLInputElement;

    const isoString = new Date().toISOString();
    input.value = isoString.substring(0, isoString.indexOf('T') + 6);
    const output = this.rootHtmlElement.shadowRoot?.querySelector(
      '#output'
    ) as HTMLElement;
    input.addEventListener('change', ev => {
      const d = new Date(input.value);
      output.textContent = `${d.toString()} ${Math.floor(
        d.getTime() / 1000
      ).toString()}`;
    });

    /**
     *
     */
    const timestamp = this.rootHtmlElement.shadowRoot?.querySelector(
      '#timestamp'
    ) as HTMLInputElement;
    timestamp.value = Math.floor(new Date().getTime() / 1000).toString();
    const output_timestamp = this.rootHtmlElement.shadowRoot?.querySelector(
      '#output-date'
    ) as HTMLElement;
    output_timestamp.textContent = new Date(+timestamp.value * 1000).toString();
    timestamp.addEventListener('change', ev => {
      const dd = new Date(+timestamp.value * 1000);
      output_timestamp.textContent = dd.toString();
    });

    /**
     *
     */
    const timezones = this.rootHtmlElement.shadowRoot?.querySelector(
      '#timezones'
    ) as HTMLSelectElement;
    Object.entries(timeZones).forEach(([tz, type]) => {
      timezones.appendChild(
        new Option(
          `${tz} (${type.shortOffset})`,
          tz,
          undefined,
          tz === Intl.DateTimeFormat().resolvedOptions().timeZone
        )
      );
    });

    // this.rootHtmlElement.appendChild(body);
    // body.addEventListener('state', ev => {
    //   this._state = (ev as CustomEvent).detail;
    //   window.console_app.set_tool_state('timestamp-tool', this._state, true);
    // });

    this.container.stateRequestEvent = () => JSON.stringify(this._state);
  }
}
