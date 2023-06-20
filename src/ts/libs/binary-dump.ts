// Decimal match
//
// Octal match
//
/**
 * Encoding
 */
const encoding = ['binary', 'octal', 'decimal', 'hexa', 'text'] as const;
export type Encoding = (typeof encoding)[number];

function is_encoding(encode: Encoding): encode is Encoding {
  return encoding.includes(encode);
}

export function check_encoding(encode: Encoding): void {
  if (!is_encoding(encode)) throw new Error('Invalid Encoding');
}

/**
 * Check valid characters
 */
function is_binary(char: string): boolean {
  const c = char.charAt(0);
  return c === '0' || c === '1';
}

function is_octal(char: string): boolean {
  const c = char.charAt(0);
  return c >= '0' && c <= '7';
}

function is_hexa(char: string): boolean {
  const c = char.charAt(0);
  return (
    (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')
  );
}

function is_decimal(char: string): boolean {
  const c = char.charAt(0);
  return c >= '0' && c <= '9';
}

function is_ascii(char: string): boolean {
  return char.charCodeAt(0) <= 255;
}

export function is_ascii_printable(char: string): boolean {
  return is_ascii_code_printable(char.charCodeAt(0));
}

export function is_ascii_code_printable(code: number): boolean {
  return code >= 32 && code <= 126;
}

/**
 * Separate function
 * This functions assume that all characters are valid based on the encoding
 */
function split_binary(str: string): string[] {
  return str.match(/[01]{1,8}/g) ?? [];
}

function split_octal(str: string): string[] {
  return str.match(/[0-3]?[0-7]{1,2}/g) ?? [];
}

function split_decimal(str: string): string[] {
  return str.match(/25[0-5]|2[0-4][0-9]|[01]?[0-9]{1,2}/g) ?? [];
}

function split_hexa(str: string): string[] {
  return str.match(/[0-9a-fA-F]{1,2}/g) ?? [];
}

function split_text(str: string): string[] {
  return str.match(/\\x[0-9a-fA-F]{1,2}|\\n|\\r|\\0|[ -~]/g) ?? [];
}

interface FormatOptions {
  pad?: string;
  separator?: string;
}

interface DataTypesInterface {
  base: number;
  char_byte_size: number;
  check_char: (char: string) => boolean;
  split: (str: string) => string[];
}

/**
 * Type definitions
 */
const dataType: Record<Encoding, DataTypesInterface> = {
  binary: {
    base: 2,
    char_byte_size: 8,
    check_char: is_binary,
    split: split_binary,
  },
  octal: {
    base: 8,
    char_byte_size: 3,
    check_char: is_octal,
    split: split_octal,
  },
  decimal: {
    base: 10,
    char_byte_size: 3,
    check_char: is_decimal,
    split: split_decimal,
  },
  hexa: {
    base: 16,
    char_byte_size: 2,
    check_char: is_hexa,
    split: split_hexa,
  },
  text: {
    base: 1,
    char_byte_size: 1,
    check_char: is_ascii,
    split: split_text,
  },
};

/**
 * Encoding functions
 */
export function is_encode_char(char: string, enc: Encoding): boolean {
  check_encoding(enc);
  return dataType[enc].check_char(char);
}

export function clear_string(str: string, enc: Encoding): string {
  check_encoding(enc);
  return Array.from(str)
    .filter(c => dataType[enc].check_char(c))
    .join('');
}

export function format(
  str: string[],
  encode: Encoding,
  opt: FormatOptions = {}
): string {
  check_encoding(encode);
  if (encode === 'text') return str.join('');

  const fmt = { ...{ separator: ' ', pad: '' }, ...opt };

  if (fmt.pad.length > 0)
    str = str.map(v => v.padStart(dataType[encode].char_byte_size, fmt.pad));
  return str.join(fmt.separator);
}

export function split(str: string, encode: Encoding): string[] {
  check_encoding(encode);
  return dataType[encode].split(str);
}

function string_to_binary(str: string): Uint8Array {
  return string_array_to_binary(split_text(str));
}

function string_array_to_binary(str: string[]): Uint8Array {
  return Uint8Array.from(
    str.map(c => {
      switch (c) {
        case '\\n':
          return 10;
        case '\\r':
          return 13;
        case '\\0':
          return 0;
        default:
          break;
      }
      const cc = c.match(/(?<=\x)[0-9a-fA-F]{1,2}/g);
      if (cc !== null && cc.length > 0) {
        return parseInt(cc[0], 16);
      }
      return c.charCodeAt(0);
    })
  );
}

export function parse(str: string, encode: Encoding): Uint8Array {
  check_encoding(encode);
  str = clear_string(str, encode);

  if (encode === 'text') return string_to_binary(str);
  return Uint8Array.from(
    dataType[encode]
      .split(str)
      .map((s: string) => parseInt(s, dataType[encode].base))
  );
}

export function to_data(str: string[], encode: Encoding): Uint8Array {
  check_encoding(encode);
  if (encode === 'text') return string_array_to_binary(str);

  return Uint8Array.from(
    str.map((s: string) => parseInt(s, dataType[encode].base))
  );
}

export function to_array_string(
  data: Uint8Array,
  encode: Encoding,
  pad: string = ''
): string[] {
  check_encoding(encode);
  if (encode === 'text') return binary_to_ascii_array(data);

  const { base, char_byte_size } = dataType[encode];
  if (pad.length > 0)
    return Array.from(data).map(n =>
      n.toString(base).padStart(char_byte_size, pad)
    );

  return Array.from(data).map(n => n.toString(base));
}

export function convert(
  input: string[],
  from: Encoding,
  to: Encoding
): string[] {
  if (from === to) return input;
  const d = to_data(input, from);
  return to_array_string(d, to);
}

export function is_valid(str: string, encode: Encoding): boolean {
  return Array.from(str).every(c => is_encode_char(c, encode));
}

export type SpecialChars = Record<string, string>;

const specialChars: SpecialChars = {
  '\0': '\\0',
  '\n': '\\n',
  '\r': '\\r',
};

export function string_to_ascii_array(
  chunk: string,
  chars: SpecialChars = specialChars
): string[] {
  const out: string[] = [];
  for (const c of chunk) {
    if (c in chars) {
      out.push(chars[c]);
      continue;
    }

    if (!is_ascii_printable(c)) {
      out.push('\\x' + c.charCodeAt(0).toString(16).padStart(2, '0'));
    } else out.push(c);
  }
  return out;
}

export function string_to_ascii(
  chunk: string,
  chars: SpecialChars = specialChars
): string {
  return string_to_ascii_array(chunk, chars).join('');
}

export function binary_to_ascii_array(
  chunk: Uint8Array,
  chars: SpecialChars = specialChars
): string[] {
  const out: string[] = [];
  for (const code of chunk) {
    const c = String.fromCharCode(code);
    if (c in chars) {
      out.push(chars[c]);
      continue;
    }

    if (!is_ascii_code_printable(code)) {
      out.push('\\x' + code.toString(16).padStart(2, '0'));
    } else out.push(c);
  }
  return out;
}

export function binary_to_ascii(
  chunk: Uint8Array,
  chars: SpecialChars = specialChars
): string {
  return binary_to_ascii_array(chunk, chars).join('');
}
