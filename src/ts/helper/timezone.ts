// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat

const timeZonesTypes = [
  'long',
  'longOffset',
  'longGeneric',
  'short',
  'shortOffset',
  'shortGeneric',
] as const;

export interface TimeZoneInfo {
  local: string;
  long: string;
  longOffset: string;
  longGeneric: string;
  short: string;
  shortOffset: string;
  shortGeneric: string;
  minutes: number;
}

function to_minutes(offset: string): number {
  if (offset === 'GMT') return 0;
  const data: number[] = offset
    .replace('GMT', '')
    .split(':')
    .map(b => +b);
  const minutes = +data[0] * 60;
  return minutes < 0 ? minutes - +data[1] : minutes + +data[1];
}

export const timeZones: Record<string, TimeZoneInfo> = (function () {
  const tzs: Record<string, TimeZoneInfo> = {};
  Intl.supportedValuesOf('timeZone').forEach((tz: string) => {
    const data: Record<string, any> = { local: tz };
    timeZonesTypes.forEach(type => {
      data[type] = Intl.DateTimeFormat('ia', {
        timeZoneName: type,
        timeZone: tz,
      })
        .formatToParts()
        .find(i => i.type === 'timeZoneName')?.value;
    });
    data.minutes = to_minutes(data.longOffset);
    tzs[tz] = data as TimeZoneInfo;
  });
  return tzs;
})();

export const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// https://stackoverflow.com/a/54127122
export function convert_timezone(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString(undefined, { timeZone: timezone }));
}

export const dateFormatOptionsDefault: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  // hour12: false,
  hourCycle: 'h23',
  minute: '2-digit',
  second: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  weekday: 'short',
  timeZoneName: 'longOffset',
  timeZone: undefined,
};

interface FormatDatePartsOutput {
  day: string;
  month: string;
  year: number;
  weekday: string;
  hour: string;
  minute: string;
  second: string;
  timeZoneName: string;
}

export function format_to_parts(
  date: Date,
  options: Intl.DateTimeFormatOptions = dateFormatOptionsDefault
): FormatDatePartsOutput {
  return Intl.DateTimeFormat('ia', options)
    .formatToParts(date)
    .reduce<Record<string, any>>((acc, v) => {
      acc[v.type] = v.value;
      return acc;
    }, {}) as FormatDatePartsOutput;
}

export interface FormatDateOutput {
  date: string;
  time: string;
  timestamp: string;
}

export function format(
  options: Intl.DateTimeFormatOptions = dateFormatOptionsDefault
): (date: Date) => FormatDateOutput {
  const format: Intl.DateTimeFormat = Intl.DateTimeFormat('ia', options);
  return function (date: Date): FormatDateOutput {
    const f = format
      .formatToParts(date)
      .reduce<Record<string, any>>((acc, v) => {
        acc[v.type] = v.value;
        return acc;
      }, {}) as FormatDatePartsOutput;
    const temp: string = f.timeZoneName.replace(/GMT|:/g, '');
    const offset = temp.length > 0 ? ` ${temp}` : ' +0000';

    return {
      date: `${f.day}/${f.month}/${f.year} ${f.weekday}`,
      time: `${f.hour}:${f.minute}:${f.second}${offset}`,
      timestamp: `${Math.floor(date.getTime() / 1000)}`,
    };
  };
}

export function format_utc(): (date: Date) => FormatDateOutput {
  const format: Intl.DateTimeFormat = Intl.DateTimeFormat('ia', {
    ...dateFormatOptionsDefault,
    timeZone: 'UTC',
  });
  return function (date: Date): FormatDateOutput {
    const f = format
      .formatToParts(date)
      .reduce<Record<string, any>>((acc, v) => {
        acc[v.type] = v.value;
        return acc;
      }, {}) as FormatDatePartsOutput;
    return {
      date: `${f.day}/${f.month}/${f.year} ${f.weekday}`,
      time: `${f.hour}:${f.minute}:${f.second}`,
      timestamp: `${Math.floor(date.getTime() / 1000)}`,
    };
  };
}
