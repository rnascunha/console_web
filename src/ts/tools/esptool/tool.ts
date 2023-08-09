import './web-components/file';
import './web-components/file-list';

import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { ESPToolComponent } from './component';

export class ESPToolTool extends Tool {
  constructor() {
    super('esptool', ESPToolComponent);
  }

  public override open_link(url: URL): JsonValue {
    return {};
  }
}
