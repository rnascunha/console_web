import { base64_decode, base64_encode } from '../../libs/base64';
import { encoding, type Encoding } from '../../libs/binary-dump';
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

    #breakline-container {
      align-self: flex-end;
    }

    #dump-container {
      overflow: auto;
      height: 100%;
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
    <label id=breakline-container><b>Breakline</b><br>
      <input type=number min=1 max=16 id=breakline>
    </label>
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
  constructor(options: InputDumpOptions = {}) {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));

    this._input = this.shadowRoot?.querySelector(
      '#input'
    ) as BinaryInputAreaRadio;
    this._dump = this.shadowRoot?.querySelector('#dump') as BinaryDump;
    this._breakline = this.shadowRoot?.querySelector(
      '#breakline'
    ) as HTMLInputElement;

    Promise.all([
      customElements.whenDefined('binary-dump'),
      customElements.whenDefined('text-area-radio-binary'),
    ])
      .then(() => {
        if (options.data !== undefined)
          this._input.data = base64_decode(options.data);
        this._input.encode = options.encode ?? 'text';
        this._breakline.value = options.breakline?.toString() ?? '8';

        const update = (): void => {
          this._dump.update(this._input.data, +this._breakline.value);
          this.dispatchEvent(
            new CustomEvent('state', {
              detail: {
                data: base64_encode(this._input.data),
                encode: this._input.encode,
                breakline: +this._breakline.value,
                hide: this._dump.hided,
              },
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

        this.shadowRoot?.querySelectorAll('input[name=encode]').forEach(v => {
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

  public set state(s: InputDumpOptions) {
    if (s.data !== undefined) this._input.data = base64_decode(s.data);
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
