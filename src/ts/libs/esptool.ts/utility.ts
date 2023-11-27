import { format, to_array_string } from '../binary-dump';
import { ESPError, error_code } from './error';

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
  const hash_buffer = await crypto.subtle.digest('SHA-256', blob); // hash the message
  return blob_to_hex(hash_buffer);
}

export function read_c_string(string: string, char: string = '\x00'): string {
  return string.substring(0, string.indexOf(char));
}

export async function compress_image(
  input: ArrayBuffer,
  type: CompressionFormat
): Promise<ArrayBuffer> {
  return await new Response(
    new Response(input).body?.pipeThrough(new CompressionStream(type))
  ).arrayBuffer();
}

export async function image_hash_compare(image: ArrayBuffer): Promise<string> {
  if (!digest_support())
    throw new ESPError(error_code.NOT_SUPPORTED, 'Crypto API not supported');

  const calculated = await hex_sha256(image.slice(0, -32));
  const hash = blob_to_hex(image.slice(-32));

  if (calculated !== hash)
    throw new ESPError(error_code.HASH_NOT_MATCH, 'Hash not match', {
      calculated,
      hash,
    });

  return hash;
}
