import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { Encoding, parse } from '../libs/binary-dump';
import { BinaryDump } from '../web-components/binary-dump/binary-dump';
import type { BinaryInputSelect } from '../web-components/binary-input/text-select-binary';

export class DockDumpComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const parsed = JSON.parse(state as string);
    const data = parse(parsed.data as string, 'text');

    this.container.setTitle('Binary Dump');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Binary Dump';
    }

    const body = new BinaryDump(8, data, { hide: parsed.hide });
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

export function create_binary_dump_html(
  data: Uint8Array,
  bl: number,
  options: { hide: Encoding[] } = { hide: [] as Encoding[] }
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
  breakline.value = bl.toString();

  Promise.all([
    customElements.whenDefined('binary-dump'),
    customElements.whenDefined('text-select-binary'),
  ])
    .then(() => {
      input.data = data;
      input.encode = 'text';
      dump.update(data, bl);
      dump.hide(...options.hide);

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
        dump.update(input.data, bl);
      };
      input.focus();
    })
    .finally(() => {});

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

    this.container.setTitle('Binary Dump');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Binary Dump';
    }

    this.rootHtmlElement.appendChild(
      create_binary_dump_html(
        parse(parsed.data as string, 'text'),
        parsed.breakline,
        { hide: parsed.hide }
      )
    );
  }
}
