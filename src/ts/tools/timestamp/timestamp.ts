import EventEmitter from '../../libs/event_emitter';
import {
  create_clock,
  create_select_timezone,
  type ClockOptions,
} from './functions';
import {
  type CalendarTimestamp,
  get_calendar_options,
  type CalendarTimestampOptions,
} from '../../web-components/calendar/calendar-timestamp';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    select {
      max-width: 100px;
    }
  </style>
  <input type="datetime-local" id=datetime />
  <select id=datetime-timezone></select>
  <input type=number min=0 id=timestamp />
  <button id=submit-date>Add</button>
  <button id=update-now>now</button>
  <div id=output></div>`;
  return template;
})();

interface TimestampState {
  timestamp: number;
  timezone: string;
}

interface TimestampAppEvents {
  state: TimestampState[];
}

export class TimestampApp extends EventEmitter<TimestampAppEvents> {
  private readonly _input: HTMLInputElement;
  private readonly _timestamp: HTMLInputElement;
  private readonly _output: HTMLElement;
  private readonly _clock: CalendarTimestamp;

  private readonly _state: TimestampState[];

  constructor(container: HTMLElement, timestamps: TimestampState[] = []) {
    super();

    container.appendChild(template.content.cloneNode(true));

    this._input = container.querySelector('#datetime') as HTMLInputElement;
    const select = container.querySelector(
      '#datetime-timezone'
    ) as HTMLSelectElement;
    create_select_timezone(select);
    this._timestamp = container.querySelector('#timestamp') as HTMLInputElement;
    const add_button = container.querySelector(
      '#submit-date'
    ) as HTMLButtonElement;
    const now = container.querySelector('#update-now') as HTMLButtonElement;
    this._output = container.querySelector('#output') as HTMLElement;

    this._clock = create_clock(
      select.value,
      get_calendar_options(select.value),
      {
        closeable: false,
        update: new Date(+this._timestamp.value * 1000),
      }
    );
    this._output.appendChild(this._clock);

    this._input.addEventListener('change', () => {
      this.update(new Date(this._input.value));
    });

    this._timestamp.addEventListener('change', ev => {
      this.update(new Date(+this._timestamp.value * 1000));
    });

    add_button?.addEventListener('click', () => {
      this.add(select.value, get_calendar_options(select.value), {
        closeable: true,
        update: new Date(+this._timestamp.value * 1000),
      });
    });

    now.addEventListener('click', () => {
      this.update(new Date());
    });

    this._state = timestamps;
    timestamps.forEach(v => {
      this.add(v.timezone, get_calendar_options(v.timezone), {
        closeable: true,
        update: new Date(v.timestamp * 1000),
      });
    });

    this.update(new Date());
  }

  private update(date: Date): void {
    this._timestamp.value = Math.floor(date.getTime() / 1000).toString();
    this._input.value = date.toISOString().slice(0, -5);
    this._clock.update(date);
  }

  private add(
    name: string,
    options: CalendarTimestampOptions,
    clock_options: ClockOptions
  ): void {
    const c = create_clock(name, options, clock_options);
    this._output.appendChild(c);

    const state: TimestampState = {
      timezone: options.timezone as string,
      timestamp: clock_options.update?.getTime() as number,
    };
    this._state.push(state);
    this.emit('state', this._state);
    c.addEventListener('click', ev => {
      const source = ev.composedPath()[0] as HTMLElement;
      if (source.classList.contains('close')) {
        this._output.removeChild(c);
        this._state.splice(this._state.indexOf(state), 1);
        this.emit('state', this._state);
      }
    });
  }
}
