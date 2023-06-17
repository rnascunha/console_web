const encoding = ['binary', 'octal', 'hexa', 'text'] as const;
type Encoding = (typeof encoding)[number];

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
    (c >= '0' && c <= '9') || (c.toLowerCase() >= 'a' && c.toLowerCase() <= 'f')
  );
}

function is_encoding(encode: Encoding): encode is Encoding {
  return encoding.includes(encode);
}

function check_encoding(encode: Encoding): void {
  if (!is_encoding(encode)) throw new Error('Invalid Encoding');
}

function is_encode_char(char: string, enc: Encoding): boolean {
  check_encoding(enc);
  switch (enc) {
    case 'binary':
      return is_binary(char);
    case 'octal':
      return is_octal(char);
    case 'hexa':
      return is_hexa(char);
    default:
      return true;
  }
}

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = '<input>';
  return template;
})();

class BinaryInput extends HTMLElement {
  private _encode: Encoding = 'hexa';
  private readonly _input: HTMLInputElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
    this._input = this.shadowRoot?.querySelector('input') as HTMLInputElement;

    this._input.onkeydown = ev => {
      if (!is_encode_char(ev.key, this._encode)) ev.preventDefault();
    };

    // this._input.onkeyup = ev => {
    //   if (ev.key.length > 1) ev.preventDefault();
    // };
  }

  set encode(enc: Encoding) {
    check_encoding(enc);
    if (enc === this._encode) return;

    this._encode = enc;
  }

  get encode(): Encoding {
    return this._encode;
  }
}

customElements.define('text-binary', BinaryInput);
