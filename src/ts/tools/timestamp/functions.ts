import { timeZones, type TimeZoneInfo } from '../../helper/timezone';

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
