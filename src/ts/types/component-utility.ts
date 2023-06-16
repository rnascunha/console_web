import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { string_to_binary } from '../helper/encode';
import { BinaryDump } from '../components/binary-dump/binary-dump';

export class DockDumpComponent extends ComponentBase {
  private readonly _data: Uint8Array;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._data = string_to_binary(state as string);

    this.container.setTitle('Binary Dump');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Binary Dump';
    }

    const body = new BinaryDump();
    body.classList.add('window-body');
    body.update(this._data, 8);
    this.rootHtmlElement.appendChild(body);

    this.container.stateRequestEvent = () => {
      // console.log('event');
      return state;
    };
  }
}
