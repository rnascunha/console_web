import { timeFormat, utcFormat } from 'd3';

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
  dateFormat?: (date: Date) => string;
  timeFormat?: (date: Date) => string;
  timestampFormat?: (date: Date) => string;
}

export const calendarTimestampOptionsDefault: CalendarTimestampOptions = {
  dateFormat: timeFormat('%d/%m/%Y %a'),
  timeFormat: timeFormat('%H:%M:%S %Z'),
  timestampFormat: utcFormat('%s'),
};

export const calendarTimestampUTCOptionsDefault: CalendarTimestampOptions = {
  dateFormat: utcFormat('%d/%m/%Y %a'),
  timeFormat: utcFormat('%H:%M:%S'),
  timestampFormat: utcFormat('%s'),
};

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

  public update(d: Date = new Date()): void {
    this._time.textContent = this._options.timeFormat?.(d) ?? '';
    this._date.textContent = this._options.dateFormat?.(d) ?? '';
    this._timestamp.textContent = this._options.timestampFormat?.(d) ?? '';
  }
}

customElements.define('calendar-timestamp', CalendarTimestamp);
