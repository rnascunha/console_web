import { format, to_array_string } from '../binary-dump';

export function digest_support(): boolean {
  return 'crypto' in window && 'subtle' in window.crypto;
}

export function compression_support(): boolean {
  return 'CompressionStream' in window;
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export function blob_to_hex(blob: ArrayBuffer): string {
  return format(to_array_string(new Uint8Array(blob), 'hexa'), 'hexa', {
    separator: '',
    pad: '0',
  });
}

export async function hex_sha256(blob: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', blob); // hash the message
  return blob_to_hex(hashBuffer);
}

export function read_c_string(string: string, char: string = '\x00'): string {
  return string.substring(0, string.indexOf(char));
}

export async function compress_buffer(
  input: ArrayBuffer,
  type: CompressionFormat = 'gzip'
): Promise<ArrayBuffer | undefined> {
  return await new Response(
    new Response(input).body?.pipeThrough(new CompressionStream(type))
  ).arrayBuffer();
}
