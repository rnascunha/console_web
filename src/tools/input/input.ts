import './input.css';

import '../../ts/web-components/binary-dump/binary-dump';
import '../../ts/web-components/binary-input/text-area-binary';
import '../../ts/web-components/binary-input/text-area-radio-binary';
import '../../ts/web-components/input-file/input-file';

import { AlertMessage } from '../../ts/web-components/alert-message/alert-message';
import {
  InputDump,
  type InputDumpOptions,
} from '../../ts/web-components/input-dump/input-dump';
import { type Encoding } from '../../ts/libs/binary-dump';
import { open_db, read_db, write_db } from './db';

const container = document.querySelector('#input-dump');
const input_dump = new InputDump(read_link());
let state: InputDumpOptions = {};
let db: IDBDatabase | undefined;

read()
  .then((state: InputDumpOptions) => {
    input_dump.state = state;
  })
  .catch(e => {
    console.warn('Error opening database');
  });

document.querySelector('#link')?.addEventListener('click', () => {});

container?.appendChild(input_dump);

const message = new AlertMessage('Link copied', arg => arg.hide())
  .append_element()
  .hide()
  .bottom();

document.querySelector('#link')?.addEventListener('click', ev => {
  navigator.clipboard.writeText(make_link(state, true)).finally(() => {});

  message.show();
});

input_dump.addEventListener('state', ev => {
  state = (ev as CustomEvent).detail;
  window.history.replaceState('state', '', make_link(state, false));
  write().finally(() => {});
});

function make_link(state: InputDumpOptions, fulllink = true): string {
  let link = `${fulllink ? window.location.origin : ''}${
    window.location.pathname
  }?encode=${state.encode as Encoding}&bl=${state.breakline as number}`;

  if (state.hide !== undefined && state.hide.length > 0)
    link += `&hide=${state.hide.join(',')}`;
  if (state.data !== undefined && state.data?.length > 0)
    link += `&data=${state.data}`;

  return link;
}

function read_link(): InputDumpOptions {
  const url = new URL(window.location.href);
  const state: InputDumpOptions = {
    breakline: 8,
    data: '',
    hide: [] as Encoding[],
    encode: 'text',
  };
  url.searchParams.forEach((value, key) => {
    switch (key) {
      case 'bl':
        state.breakline = +value;
        break;
      case 'data':
        state.data = value;
        break;
      case 'hide':
        state.hide = value.split(',') as Encoding[];
        break;
      case 'encode':
        state.encode = value as Encoding;
        break;
    }
  });
  return state;
}

async function read(): Promise<InputDumpOptions> {
  db = await open_db();
  return await read_db(db);
}

async function write(): Promise<void> {
  if (db === undefined) return;
  await write_db(db, state);
}
