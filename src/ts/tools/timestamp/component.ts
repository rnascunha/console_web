import { ComponentBase } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import {
  timeZones,
  local_timezone,
  type TimeZoneInfo,
} from '../../helper/timezone';
import {
  CalendarTimestamp,
  type CalendarTimestampOptions,
  calendarTimestampOptionsDefault,
  calendarTimestampUTCOptionsDefault,
} from '../../web-components/calendar/calendar-timestamp';

// function clock_header(title: string): HTMLElement {
//   const span = document.createElement('span');
//   span.textContent = title;
//   span.classList.add('clock-header');

//   return span;
// }

const temp_header = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .title {
      width: 100%;
    }

    .close {
      cursor: pointer;
      border-radius: 50%;
      padding: 0px 3px;
    }

    .close:hover {
      background-color: black;
      color: white;
    }
  </style>
  <span class=title></span>
  <span class=close>&#10006;</span>`;

  return template;
})();

function clock_header(title: string, closeable: boolean = false): HTMLElement {
  const span = document.createElement('span');
  span.classList.add('clock-header');
  span.attachShadow({ mode: 'open' });
  span.shadowRoot?.appendChild(temp_header.content.cloneNode(true));
  (span.shadowRoot?.querySelector('.title') as HTMLElement).textContent = title;
  if (!closeable) {
    (span.shadowRoot?.querySelector('.close') as HTMLElement).style.display =
      'none';
  }
  return span;
}

function create_clock(
  title: string,
  options: CalendarTimestampOptions,
  clock_options: { update?: Date; closeable?: boolean }
): CalendarTimestamp {
  const clock = new CalendarTimestamp(options);
  clock.classList.add('clock-body');
  clock.appendChild(clock_header(title, clock_options.closeable));

  if (clock_options.update !== undefined) clock.update(clock_options.update);

  return clock;
}

function timezone_name(tz: TimeZoneInfo): string {
  return (
    tz.local +
    ' (' +
    tz.shortOffset +
    (tz.shortOffset !== tz.shortGeneric ? `/${tz.shortGeneric}` : '') +
    ')'
  );
}

const default_clock_options: CalendarTimestampOptions = {
  ...calendarTimestampOptionsDefault,
  timestampFormat: undefined,
};

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
  <div>
    <h2>Clocks</h2>
    <select id=select-clock></select>
    <button id=add-clock>Add</button>
    <div id=clocks></div>
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

    console.log(timeZones);

    // this._state = JSON.parse(state as string);

    this.title = 'Timestamp';
    this.rootHtmlElement.attachShadow({ mode: 'open' });
    this.rootHtmlElement.shadowRoot?.appendChild(
      template.content.cloneNode(true)
    );

    /**
     *
     */
    const clock_select = this.rootHtmlElement.shadowRoot?.querySelector(
      '#select-clock'
    ) as HTMLSelectElement;
    Object.entries(timeZones).forEach(([tz, type]) => {
      clock_select.appendChild(
        new Option(timezone_name(type), tz, undefined, tz === local_timezone())
      );
    });

    const add_clock = this.rootHtmlElement.shadowRoot?.querySelector(
      '#add-clock'
    ) as HTMLButtonElement;
    const clocks: CalendarTimestamp[] = [];
    add_clock.addEventListener('click', ev => {
      const c = create_clock(clock_select.value, default_clock_options, {
        update: new Date(),
        closeable: true,
      });
      clocks.push(c);
      clocks_container.appendChild(c);
      // (c.shadowRoot?.querySelector('.close') as HTMLElement).addEventListener(
      c.addEventListener('click', ev => {
        const source = ev.composedPath()[0] as HTMLElement;
        if (source.classList.contains('close')) {
          clocks.splice(clocks.indexOf(c), 1);
          clocks_container.removeChild(c);
        }
      });
    });

    const clocks_container = this.rootHtmlElement.shadowRoot?.querySelector(
      '#clocks'
    ) as HTMLElement;

    const date = new Date();
    const utc = create_clock('UTC', calendarTimestampUTCOptionsDefault, {
      update: date,
      closeable: false,
    });
    const local = create_clock(
      `${local_timezone()} (local)`,
      default_clock_options,
      { update: date, closeable: false }
    );

    clocks_container.appendChild(utc);
    clocks_container.appendChild(local);

    const token = setInterval(function () {
      const date = new Date();
      utc.update(date);
      local.update(date);
      clocks.forEach(clk => {
        clk.update(date);
      });
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

    // this.container.stateRequestEvent = () => JSON.stringify(this._state);
  }
}
