import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { BinaryDump } from '../web-components/binary-dump/binary-dump';
import { base64_decode } from '../libs/base64';

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

    const body = new BinaryDump(8, data, {
      hide: parsed.hide,
    });
    body.classList.add('window-body');
    this.rootHtmlElement.appendChild(body);
  }
}
