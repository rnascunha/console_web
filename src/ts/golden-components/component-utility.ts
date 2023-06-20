import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { parse } from '../libs/binary-dump';
import { BinaryDump } from '../web-components/binary-dump/binary-dump';

export class DockDumpComponent extends ComponentBase {
  private readonly _data: Uint8Array;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const parsed = JSON.parse(state as string);
    this._data = parse(parsed.data as string, 'text');

    this.container.setTitle('Binary Dump');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Binary Dump';
    }

    const body = new BinaryDump(8, this._data, { hide: parsed.hide });
    body.classList.add('window-body');
    this.rootHtmlElement.appendChild(body);
  }
}
