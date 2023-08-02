import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { JSONComponent, type JSONOptions } from './component';
import { base64_decode } from '../../libs/base64';

export class JSONTool extends Tool {
  constructor() {
    super('json', JSONComponent);
  }

  public override open_link(url: URL): JsonValue {
    const state: JSONOptions = {};
    url.searchParams.forEach((value, key) => {
      switch (key) {
        case 'value':
          state.value = new TextDecoder().decode(base64_decode(value));
      }
    });
    return state;
  }
}
