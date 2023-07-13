import {
  timeZones,
  type TimeZoneInfo,
  localTimezone,
} from '../../helper/timezone';
import {
  CalendarTimestamp,
  type CalendarTimestampOptions,
} from '../../web-components/calendar/calendar-timestamp';

export function timezone_name(tz: TimeZoneInfo): string {
  const extra: string[] = [];
  const city = tz.local.split('/')[1].replace(/_/g, ' ');

  const offset = tz.shortOffset.replace('GMT', '');
  if (offset.length > 0) extra.push(offset);

  const generic_short = tz.shortGeneric.replace(/( Time)$/, '');
  const generic =
    tz.shortOffset !== tz.shortGeneric && city !== generic_short
      ? `${generic_short}`
      : '';
  if (generic.length > 0) extra.push(generic);

  if (extra.length === 0) return tz.local;
  return `${tz.local} (${extra.join('/')})`;
}

export const timeZoneInfoSorted = Object.values(timeZones).sort(function (
  a,
  b
) {
  if (a.minutes === b.minutes)
    return a.local < b.local ? -1 : a.local > b.local ? 1 : 0;

  return a.minutes < b.minutes ? -1 : 1;
});

export function create_select_timezone(
  select: HTMLSelectElement,
  default_tz: string = localTimezone
): void {
  timeZoneInfoSorted.forEach(tz => {
    select.appendChild(
      new Option(
        timezone_name(tz),
        tz.local,
        undefined,
        tz.local === default_tz
      )
    );
  });
}

const template = (function () {
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

export interface ClockOptions {
  update?: Date;
  closeable?: boolean;
}

function clock_header(title: string, closeable: boolean = false): HTMLElement {
  const span = document.createElement('span');
  span.classList.add('clock-header');
  span.attachShadow({ mode: 'open' });
  span.shadowRoot?.appendChild(template.content.cloneNode(true));
  (span.shadowRoot?.querySelector('.title') as HTMLElement).textContent = title;
  if (!closeable) {
    (span.shadowRoot?.querySelector('.close') as HTMLElement).style.display =
      'none';
  }
  return span;
}

export function create_clock(
  title: string,
  options: CalendarTimestampOptions,
  clock_options: ClockOptions
): CalendarTimestamp {
  const clock = new CalendarTimestamp(options);
  clock.classList.add('clock-body');
  clock.appendChild(clock_header(title, clock_options.closeable));

  if (clock_options.update !== undefined) clock.update(clock_options.update);

  return clock;
}
