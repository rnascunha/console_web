import { ComponentBase } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      height: 100%;
      background-color: grey !important;
    }
  </style>
  <div>
    <div id=utc></div>
    <div id=iso></div>
    <div id=local></div>
  </div>
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
  // private _state: Record<string, any>;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    // this._state = JSON.parse(state as string);

    this.title = 'Timestamp';
    this.rootHtmlElement.attachShadow({ mode: 'open' });
    this.rootHtmlElement.shadowRoot?.appendChild(
      template.content.cloneNode(true)
    );

    /**
     *
     */
    const utc = this.rootHtmlElement.shadowRoot?.querySelector(
      '#utc'
    ) as HTMLElement;
    const iso = this.rootHtmlElement.shadowRoot?.querySelector(
      '#iso'
    ) as HTMLElement;
    const local = this.rootHtmlElement.shadowRoot?.querySelector(
      '#local'
    ) as HTMLElement;

    const date = new Date();
    utc.textContent = date.toString();
    iso.textContent = date.toISOString();
    local.textContent = date.toLocaleString();

    const token = setInterval(function () {
      const date = new Date();
      utc.textContent = date.toString();
      iso.textContent = date.toISOString();
      local.textContent = date.toLocaleString();
    }, 1000);

    this.container.on('beforeComponentRelease', () => {
      clearInterval(token);
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
    Intl.supportedValuesOf('timeZone').forEach((tz: string) => {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
      const name = Intl.DateTimeFormat('ia', {
        timeZoneName: 'shortOffset',
        timeZone: tz,
      })
        .formatToParts()
        .find(i => i.type === 'timeZoneName')?.value;

      timezones.appendChild(
        new Option(
          `${tz} (${name ?? ''})`,
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

    // this.container.stateRequestEvent = () => JSON.stringify(this._state);
  }
}
