import './input.css';
import '../../css/window.css';

import '../../ts/web-components/binary-dump/binary-dump';
import '../../ts/web-components/binary-input/text-binary';
import '../../ts/web-components/binary-input/text-select-binary';

import { BinaryDump } from '../../ts/web-components/binary-dump/binary-dump';
import { BinaryInput } from '../../ts/web-components/binary-input/text-binary';
import { encoding, type Encoding } from '../../ts/libs/binary-dump';
import { base64_decode, base64_encode } from '../../ts/libs/base64';

import { open_db, write_db, read_db } from './db';

const bl = document.querySelector('#breakline') as HTMLInputElement;
const bd = document.querySelector('#data-dump') as BinaryDump;
const input_binary = document.querySelector('#input-binary') as BinaryInput;
input_binary.encode = 'text';
let db: IDBDatabase | undefined;

open_db()
  .then(mdb => {
    db = mdb;
    read().then(() => {
      init();
    });
  })
  .catch(err => {
    console.log('error', err);
  });

function init() {
  read_link();

  bl.onchange = () => update();
  input_binary.onkeyup = () => update();
  document.querySelectorAll('input[name=encode]').forEach(v => {
    const i = v as HTMLInputElement;
    i.onclick = () => {
      input_binary.encode = i.value as Encoding;
      update();
    };
  });

  document.querySelectorAll('input[name=binary-hide]').forEach(v => {
    const i = v as HTMLInputElement;
    i.onclick = () => {
      if (i.checked) bd.hide(i.value as Encoding);
      else bd.show(i.value as Encoding);
    };

    if (bd.is_hidden(i.value as Encoding)) i.checked = true;
  });

  document.querySelector('#share')?.addEventListener('click', () => {
    navigator.clipboard.writeText(make_link());
  });
}

function update() {
  bd.update(input_binary.data, +bl.value);
  write();
}

function make_link(): string {
  let link = `${window.location.origin}${window.location.pathname}?encode=${
    input_binary.encode
  }&bl=${+bl.value}`;

  const hide: string[] = [];
  encoding.forEach(e => {
    if (bd.is_hidden(e)) hide.push(e);
  });
  if (hide.length > 0) link += `&hide=${hide.join(',')}`;
  const data = input_binary.data;
  if (data.length > 0) link += `&data=${base64_encode(data)}`;

  return link;
}

function read_link(): void {
  const url = new URL(window.location.href);
  url.searchParams.forEach((value, key) => {
    switch (key) {
      case 'bl':
        bl.value = value;
        break;
      case 'data':
        input_binary.data = base64_decode(value);
        break;
      case 'hide':
        bd.hide(...(value.split(',') as Encoding[]));
        set_hide();
        break;
      case 'encode':
        input_binary.encode = value as Encoding;
        break;
    }
  });
  set_encode();
  update();
}

function write(): Promise<void> {
  if (db === undefined) return Promise.resolve();
  return write_db(db, {
    breakline: +bl.value,
    data: input_binary.data,
    hide: encoding.reduce<Encoding[]>((acc, v) => {
      if (bd.is_hidden(v)) acc.push(v);
      return acc;
    }, []),
    encode: input_binary.encode,
  });
}

function read(): Promise<void> {
  if (db === undefined) return Promise.resolve();
  return read_db(db).then(data => {
    if (data === undefined) return;
    bl.value = data.breakline.toString();
    input_binary.encode = data.encode;
    bd.hide(...data.hide);
    input_binary.data = data.data;
    set_hide();
    set_encode();
    update();
  });
}

function set_hide() {
  document.querySelectorAll('input[name=binary-hide]').forEach(v => {
    const i = v as HTMLInputElement;
    i.checked = bd.is_hidden(i.value as Encoding);
  });
}

function set_encode() {
  document.querySelectorAll('input[name=encode]').forEach(v => {
    const i = v as HTMLInputElement;
    i.checked = i.value === input_binary.encode;
  });
}

/**
 *
 */
// import { BinaryInputSelect } from '../../ts/web-components/binary-input/text-select-binary';
// const input_select = document.querySelector(
//   '#data-input-select'
// ) as BinaryInputSelect;
// const dump2 = document.querySelector('#data-dump-select') as BinaryDump;

// input_select.onkeyup = () => update2();
// input_select.onchange = () => update2();

// function update2() {
//   dump2.update(input_select.data, +bl.value);
// }
