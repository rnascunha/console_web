function binary_to_baseX(data:Uint8Array,
                         base:number,
                         pad:number,
                         pad_str:string = '0') : Array<string> {
  return data.reduce((acc, v) => {
    acc.push(v.toString(base).padStart(pad, pad_str));
    return acc;
  }, [] as Array<string>);
}

export function binary_to_decimal(data:Uint8Array) : Array<string> {
  return binary_to_baseX(data, 10, 3);
}

export function binary_to_octal(data:Uint8Array) : Array<string> {
  return binary_to_baseX(data, 8, 3);
}

export function binary_to_hexa(data:Uint8Array) : Array<string> {
  return binary_to_baseX(data, 16, 2);
}

export function binary_to_ascii(data:Uint8Array) : Array<string> {
  return data.reduce((acc, v) => {
    (acc as Array<string>).push((v < 32 || v > 126) ? '.' : String.fromCharCode(v));
    return acc;
  }, []);
}

export function string_to_binary(data:string) : Uint8Array {
  const buffer = new ArrayBuffer(data.length);
  const arr = new Uint8Array(buffer);

  for (let i = 0; i < data.length; ++i)
    arr[i] = data.charCodeAt(i);

  return arr;
}

export function to_binary_array_element(data:Uint8Array,
                           value:Array<string>) : Array<HTMLSpanElement> {
  const out:Array<HTMLSpanElement> = [];
  data.forEach((v, i) => {
    const s = document.createElement('span');
    s.dataset.value = v.toString(10);
    s.dataset.idx = i.toString(10);
    s.textContent = value[i];
    out.push(s);
  });
  return out;
}

export function break_line_array(els:Array<HTMLSpanElement>, br:number) : Array<HTMLSpanElement> {
  /**
   * TODO: Add a assert that BR must be positive integer
   */
  return els.reduce((acc, v, idx) => {
    if (idx != 0 && (idx % br) == 0)
      acc.push(document.createElement('br'));
    acc.push(v);
    return acc;
  }, [] as Array<HTMLSpanElement>);
}

export function create_break_line_field(el:HTMLElement, lines:number, br:number) {
  el.innerHTML = '';
  let i = 0;
  while(true) {
    const span = document.createElement('span');
    span.textContent = i.toString(16).padStart(4, '0');
    el.appendChild(span);
    i += br;
    if (i >= lines)
      break;
    el.appendChild(document.createElement('br'));
  }
}
