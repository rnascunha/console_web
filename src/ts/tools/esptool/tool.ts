import './web-components/file';
import './web-components/file-list';

import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { ESPToolComponent, ESPToolOptions } from './component';

export class ESPToolTool extends Tool {
  constructor() {
    super('esptool', ESPToolComponent);
  }

  public override open_link(url: URL): JsonValue {
    const state: ESPToolOptions = {};
    url.searchParams.forEach((value, key) => {
      switch (key) {
        case 'debug':
          state.debug = value === '1';
          break;
      }
    });
    return state;
  }
}
