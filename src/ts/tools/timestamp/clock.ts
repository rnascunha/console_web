import { localTimezone } from '../../helper/timezone';
import EventEmitter from '../../libs/event_emitter';
import {
  type CalendarTimestamp,
  type CalendarTimestampOptions,
  get_calendar_options_no_timestamp,
  calendarTimestampUTCOptionsDefault,
} from '../../web-components/calendar/calendar-timestamp';
import {
  create_select_timezone,
  create_clock,
  type ClockOptions,
} from './functions';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <select id=select-clock></select>
  <button id=add-clock>Add</button>
  <div id=clocks></div>`;

  return template;
})();

interface ClockAppEvents {
  state: string[];
}

export class ClockApp extends EventEmitter<ClockAppEvents> {
  private readonly _token: number;
  private readonly _clocks: CalendarTimestamp[] = [];

  private readonly _clock_container: HTMLElement;

  constructor(container: HTMLElement, timezones: string[] = []) {
    super();

    container.appendChild(template.content.cloneNode(true));

    const clock_select = container.querySelector(
      '#select-clock'
    ) as HTMLSelectElement;
    create_select_timezone(clock_select);

    const add_clock = container.querySelector(
      '#add-clock'
    ) as HTMLButtonElement;
    add_clock.addEventListener('click', ev => {
      this.add(
        clock_select.value,
        get_calendar_options_no_timestamp(clock_select.value),
        {
          closeable: true,
          update: new Date(),
        }
      );
    });

    this._clock_container = container.querySelector('#clocks') as HTMLElement;

    const date = new Date();
    this.add('UTC', calendarTimestampUTCOptionsDefault, {
      update: date,
      closeable: false,
    });
    this.add(
      `${localTimezone.split('/')[1]} (local)`,
      get_calendar_options_no_timestamp(),
      {
        update: date,
        closeable: false,
      }
    );

    timezones.forEach(tz => {
      this.add(tz, get_calendar_options_no_timestamp(tz), {
        update: date,
        closeable: true,
      });
    });

    this._token = window.setInterval(() => {
      const date = new Date();
      this._clocks.forEach((clk: CalendarTimestamp) => {
        clk.update(date);
      });
    }, 1000);
  }

  public stop(): void {
    clearInterval(this._token);
  }

  private add(
    name: string,
    options: CalendarTimestampOptions,
    clock_options: ClockOptions
  ): void {
    const c = create_clock(name, options, clock_options);
    this._clocks.push(c);
    this._clock_container.appendChild(c);
    this.emit('state', this.get_timezones());
    c.addEventListener('click', ev => {
      const source = ev.composedPath()[0] as HTMLElement;
      if (source.classList.contains('close')) {
        this._clocks.splice(this._clocks.indexOf(c), 1);
        this._clock_container.removeChild(c);
        this.emit('state', this.get_timezones());
      }
    });
  }

  private get_timezones(): string[] {
    return this._clocks
      .filter(clk => clk.timezone !== 'UTC' && clk.timezone !== undefined)
      .map(clk => clk.timezone as string);
  }
}
