import {
  format,
  format_utc,
  dateFormatOptionsDefault,
  type FormatDateOutput,
} from '../../helper/timezone';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      flex-direction: column;
      font: small-caps lighter 20px/150% "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif;
      text-align: center;
    }

    #time {
      font-size: 150%;
    }

    #timestamp {
      font-size: 115%;
    }
  
  </style>
  <slot></slot>
  <span id=time></span>
  <span id=date></span>
  <span id=timestamp></span>`;
  return template;
})();

export interface CalendarTimestampOptions {
  formatter: (date: Date) => FormatDateOutput;
  timezone?: string;
}

export const calendarTimestampOptionsDefault: CalendarTimestampOptions = {
  formatter: format(),
};

export const calendarTimestampUTCOptionsDefault: CalendarTimestampOptions = {
  formatter: format_utc(),
};

export function get_calendar_options(
  timezone?: string
): CalendarTimestampOptions {
  return {
    formatter: format({ ...dateFormatOptionsDefault, timeZone: timezone }),
    timezone,
  };
}

export function get_calendar_options_no_timestamp(
  timezone?: string
): CalendarTimestampOptions {
  const fmt = format({ ...dateFormatOptionsDefault, timeZone: timezone });
  return {
    formatter: function (d: Date) {
      const f = fmt(d);
      return {
        date: f.date,
        time: f.time,
        timestamp: '',
      };
    },
    timezone,
  };
}

export class CalendarTimestamp extends HTMLElement {
  private readonly _time: HTMLElement;
  private readonly _date: HTMLElement;
  private readonly _timestamp: HTMLElement;

  private readonly _options: CalendarTimestampOptions;

  constructor(
    options: CalendarTimestampOptions = calendarTimestampOptionsDefault
  ) {
    super();

    this._options = options;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    this._time = this.shadowRoot?.querySelector('#time') as HTMLElement;
    this._date = this.shadowRoot?.querySelector('#date') as HTMLElement;
    this._timestamp = this.shadowRoot?.querySelector(
      '#timestamp'
    ) as HTMLElement;
  }

  get timezone(): string | undefined {
    return this._options.timezone;
  }

  public update(date: Date = new Date()): void {
    const value = this._options.formatter(date);
    this._time.textContent = value.time;
    this._date.textContent = value.date;
    this._timestamp.textContent = value.timestamp;
  }
}

customElements.define('calendar-timestamp', CalendarTimestamp);
