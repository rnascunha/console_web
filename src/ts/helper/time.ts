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

export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
