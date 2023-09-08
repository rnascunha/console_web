export function time(d: Date = new Date()): string {
  return (
    `${d.getHours()}`.padStart(2, '0') +
    ':' +
    `${d.getMinutes()}`.padStart(2, '0') +
    ':' +
    `${d.getSeconds()}`.padStart(2, '0') +
    '.' +
    `${d.getMilliseconds()}`.padStart(3, '0')
  );
}

export function date(date: Date = new Date()): string {
  return (
    `${date.getDay()}`.padStart(2, '0') +
    '/' +
    `${date.getMonth()}`.padStart(2, '0') +
    '/' +
    `${date.getFullYear()}`.padStart(4, '0')
  );
}

export function date_time(d: Date = new Date()): string {
  return `${date(d)} ${time(d)}`;
}

export function miliseconds_to_duration(ms: number): string {
  const mili = ms % 1000;
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(Math.floor(ms / 1000) / 60);

  return `${min.toString().padStart(2, '0')}:${sec
    .toString()
    .padStart(2, '0')}.${mili.toString().padStart(3, '0')}`;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
