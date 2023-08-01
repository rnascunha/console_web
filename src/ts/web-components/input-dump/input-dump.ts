import '../binary-dump/binary-dump';
import '../binary-input/text-area-radio-binary';
import '../input-file/input-file';

import { base64_decode, base64_encode } from '../../libs/base64';
import { encoding, type Encoding } from '../../libs/binary-dump';
import { AlertMessage } from '../alert-message/alert-message';
import type { BinaryDump } from '../binary-dump/binary-dump';
import type { BinaryInputAreaRadio } from '../binary-input/text-area-radio-binary';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      background-color: darkgrey;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    #header {
      display: flex;
      gap: 2px;
      width: 100%;
    }

    #input {
      flex-grow: 1;
    }

    #hide {
      display: flex;
      flex-direction: column;
    }

    #options {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    #options * {
      text-align: center;
    }

    #dump-container {
      overflow: auto;
      height: 100%;
    }

    fieldset {
      padding: 2px;
      border-radius: 3px;
    }

    fieldset legend {
      font-size: small;
      font-weight: bold;
    }
  </style>
  <div id=header>
    <text-area-radio-binary id=input></text-area-radio-binary>
    <div id=hide>
      <label><input type=checkbox name=encode value=binary></label>
      <label><input type=checkbox name=encode value=octal></label>
      <label><input type=checkbox name=encode value=decimal></label>
      <label><input type=checkbox name=encode value=hexa></label>
      <label><input type=checkbox name=encode value=text></label>
      <label><input type=checkbox name=encode value=base64></label>
    </div>
    <div id=options>
      <button id=get-link>Link 🔗</button>
      <input-file id=file>File</input-file>
      <fieldset>
        <legend>Bytes</legend>
        <span id=size-bytes>0</span>
      </fieldset>
      <fieldset>
        <legend>Breakline</legend>
        <input type=number min=1 max=16 id=breakline>
      </fieldset>
    </div>
  </div>
  <div id=dump-container>
    <binary-dump id=dump></binary-dump>
  </div>`;
  return template;
})();

export interface InputDumpOptions {
  data?: string;
  encode?: Encoding;
  breakline?: number;
  hide?: Encoding[];
}

export class InputDump extends HTMLElement {
  private readonly _input: BinaryInputAreaRadio;
  private readonly _dump: BinaryDump;
  private readonly _breakline: HTMLInputElement;
  private readonly _size_bytes: HTMLSpanElement;

  constructor(options: InputDumpOptions = {}) {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._input = shadow.querySelector('#input') as BinaryInputAreaRadio;
    this._dump = shadow.querySelector('#dump') as BinaryDump;
    this._breakline = shadow.querySelector('#breakline') as HTMLInputElement;
    this._size_bytes = shadow.querySelector('#size-bytes') as HTMLSpanElement;

    Promise.all([
      customElements.whenDefined('binary-dump'),
      customElements.whenDefined('text-area-radio-binary'),
    ])
      .then(() => {
        const d = base64_decode(options.data ?? '');
        this._input.data = d;
        this._size_bytes.textContent = d.length.toString();
        this._input.encode = options.encode ?? 'text';
        this._breakline.value = options.breakline?.toString() ?? '8';

        const file_handler = async (ev: Event): Promise<void> => {
          const d = await file_event(ev);
          if (d === undefined) return;
          this._input.data = d;
          update();
        };

        shadow.querySelector('#get-link')?.addEventListener('click', ev => {
          this.dispatchEvent(
            new CustomEvent('get-link', {
              detail: this.state,
            })
          );
        });

        (shadow.querySelector('#file') as InputFile).on('change', file_handler);

        const update = (): void => {
          const d = this._input.data;
          this._dump.update(d, +this._breakline.value);
          this._size_bytes.textContent = d.length.toString();
          this.dispatchEvent(
            new CustomEvent('state', {
              detail: this.state,
            })
          );
        };

        this._input.addEventListener('keyup', () => {
          update();
        });
        this._input.shadowRoot?.addEventListener('change', () => {
          update();
        });
        this._breakline.addEventListener('change', () => {
          update();
        });
        this._dump.hide(...(options.hide ?? []));

        shadow.querySelectorAll('input[name=encode]').forEach(v => {
          const i = v as HTMLInputElement;
          i.onclick = () => {
            if (i.checked) this._dump.show(i.value as Encoding);
            else this._dump.hide(i.value as Encoding);
            update();
          };

          if (!this._dump.is_hidden(i.value as Encoding)) i.checked = true;
        });
        update();
      })
      .finally(() => {});
  }

  public override focus(): void {
    this._input.focus();
  }

  public set state(s: InputDumpOptions) {
    if (s.data !== undefined) {
      const d = base64_decode(s.data);
      this._input.data = d;
      this._size_bytes.textContent = d.length.toString();
    }
    if (s.encode !== undefined) this._input.encode = s.encode;
    if (s.hide !== undefined) {
      this._dump.show(...encoding);
      this._dump.hide(...s.hide);
    }
    if (s.breakline !== undefined)
      this._breakline.value = s.breakline.toString();
  }

  public get state(): InputDumpOptions {
    return {
      data: base64_encode(this._input.data),
      encode: this._input.encode,
      breakline: +this._breakline.value,
      hide: this._dump.hided,
    };
  }
}

customElements.define('input-dump', InputDump);

async function file_event(ev: Event): Promise<Uint8Array | undefined> {
  const target = ev.target as HTMLInputElement;
  const file_list = target.files;
  if (file_list?.length === 0) return undefined;
  const file = file_list?.[0] as File;
  const buf = await file.arrayBuffer();
  if (buf === undefined) return undefined;
  new AlertMessage(
    `File ${file.name} loaded from 0 to ${Math.min(1024, file.size)}`
  )
    .bottom()
    .append_element()
    .face_out(0.003, true);

  target.value = '';
  return new Uint8Array(buf).slice(0, 1024);
}
