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

export function local_timezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
