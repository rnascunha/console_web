export function pack32(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint32Array(args).buffer));
}

export function pack16(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint16Array(args).buffer));
}

export function unpack32(arg: number[]): number {
  return new DataView(new Uint8Array(arg).buffer).getUint32(0, true);
}
