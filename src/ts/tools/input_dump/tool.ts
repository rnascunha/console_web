import type { JsonValue } from 'golden-layout';
import type { InputDumpOptions } from '../../web-components/input-dump/input-dump';
import type { Encoding } from '../../libs/binary-dump';
import { Tool } from '../tools';
import { InputDockDumpComponent } from './component';

export class InputDumpTool extends Tool {
  constructor() {
    super('input_dump', InputDockDumpComponent);
    this.set_state({ data: '', breakline: 8, hide: [] });
  }

  public override open_link(link: URL): JsonValue {
    const url = new URL(link);
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
}
