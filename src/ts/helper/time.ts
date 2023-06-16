export function time(): string {
  const d = new Date();
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

export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}
