import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { type Encoding } from '../libs/binary-dump';
import type { BinaryDump } from '../web-components/binary-dump/binary-dump';
import type { BinaryInputSelect } from '../web-components/binary-input/text-select-binary';
import { base64_encode, base64_decode } from '../libs/base64';

export class DockDumpComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const parsed = JSON.parse(state as string);
    const data = base64_decode(parsed.data as string);

    this.container.setTitle('Binary Dump');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Binary Dump';
    }

    const body = create_binary_dump_html(data, {
      hide: parsed.hide,
      breakline: 8,
      show_header: false,
    });
    body.classList.add('window-body');
    this.rootHtmlElement.appendChild(body);
  }
}

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

    #input {
      display: block;
    }

    #dump-container {
      overflow: auto;
    }
  </style>
  <div id=header>
    <text-select-binary id=input></text-select-binary>
    <input type=number min=1 max=16 id=breakline>
    <label><input type=checkbox name=encode value=binary>Binary</label>
    <label><input type=checkbox name=encode value=octal>Octal</label>
    <label><input type=checkbox name=encode value=decimal>Decimal</label>
    <label><input type=checkbox name=encode value=hexa>Hexa</label>
    <label><input type=checkbox name=encode value=text>Text</label>
  </div>
  <div id=dump-container>
    <binary-dump id=dump></binary-dump>
  </div>`;
  return template;
})();

interface InputBinaryDumpOptionsElement {
  breakline?: number;
  encode?: Encoding;
  hide?: Encoding[];
  show_input?: boolean;
  show_header?: boolean;
}

export function create_binary_dump_html(
  data: Uint8Array,
  options: InputBinaryDumpOptionsElement = {}
): HTMLElement {
  const body = document.createElement('div');
  body.attachShadow({ mode: 'open' });
  body.classList.add('window-body');
  body.shadowRoot?.appendChild(template.content.cloneNode(true));

  const input = body.shadowRoot?.querySelector('#input') as BinaryInputSelect;
  const dump = body.shadowRoot?.querySelector('#dump') as BinaryDump;
  const breakline = body.shadowRoot?.querySelector(
    '#breakline'
  ) as HTMLInputElement;
  breakline.value = options.breakline?.toString() ?? '8';

  Promise.all([
    customElements.whenDefined('binary-dump'),
    customElements.whenDefined('text-select-binary'),
  ])
    .then(() => {
      input.data = data;
      input.encode = options.encode ?? 'text';
      dump.update(data, +breakline.value);
      dump.hide(...(options.hide ?? []));

      breakline.onchange = () => {
        dump.update(input.data, +breakline.value);
      };

      body.shadowRoot?.querySelectorAll('input[name=encode]').forEach(v => {
        const i = v as HTMLInputElement;
        i.onclick = () => {
          if (i.checked) dump.show(i.value as Encoding);
          else dump.hide(i.value as Encoding);
        };

        if (!dump.is_hidden(i.value as Encoding)) i.checked = true;
      });

      input.onkeyup = () => {
        dump.update(input.data, +breakline.value);
      };
      input.focus();
    })
    .finally(() => {});

  if ('show_header' in options && options.show_header === false) {
    (body.shadowRoot?.querySelector('#header') as HTMLElement).style.display =
      'none';
  }

  if ('show_input' in options && options.show_input === false)
    input.style.display = 'none';

  return body;
}

export class InputDockDumpComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const parsed = JSON.parse(state as string);

    this.container.setTitle('Input Dump');
    if (this.container.layoutManager.isSubWindow)
      window.document.title = 'Input Dump';

    this.rootHtmlElement.appendChild(
      create_binary_dump_html(base64_decode(parsed.data as string), {
        hide: parsed.hide,
        encode: parsed.encode,
        breakline: parsed.breakline,
        show_header: parsed.show_header,
        show_input: parsed.show_input,
      })
    );

    this.container.stateRequestEvent = this.state_change.bind(this);
  }

  private state_change(): JsonValue {
    const el = this.rootHtmlElement.firstChild as HTMLElement;
    const input = el.shadowRoot?.querySelector('#input') as BinaryInputSelect;
    const dump = el.shadowRoot?.querySelector('#dump') as BinaryDump;
    const breakline = el.shadowRoot?.querySelector(
      '#breakline'
    ) as HTMLInputElement;
    const header = el.shadowRoot?.querySelector('#breakline') as HTMLElement;

    return JSON.stringify({
      data: base64_encode(input.data),
      encode: input.encode,
      hide: dump.hided,
      breakline: +breakline.value,
      show_input: input.style.display !== 'none',
      show_header: header.style.display !== 'none',
    });
  }
}
