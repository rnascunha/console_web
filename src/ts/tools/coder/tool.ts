import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { CoderComponent, type CoderOptions } from './component';
import { base64_decode } from '../../libs/base64';

export class CoderTool extends Tool {
  constructor() {
    super('coder', CoderComponent);
  }

  public override open_link(url: URL): JsonValue {
    const state: CoderOptions = {};
    url.searchParams.forEach((value, key) => {
      switch (key) {
        case 'value':
          state.value = new TextDecoder().decode(base64_decode(value));
      }
    });
    return state;
  }
}
