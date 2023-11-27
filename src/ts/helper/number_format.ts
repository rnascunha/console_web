export function to_hex(n: number): string {
  return `0x${n.toString(16).padStart(2, '0')}`;
}

export function byte_size(size: number): string {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${Math.floor(size / 1024)}kB`;
  if (size < 1024 * 1024 * 1024) return `${Math.floor(size / (1024 * 1024))}MB`;
  return `${Math.floor(size / (1024 * 1024 * 1024))}GB`;
}
