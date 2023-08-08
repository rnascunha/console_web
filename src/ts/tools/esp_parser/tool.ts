import './web-components/file';
import './web-components/file-list';

import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { ESPParserComponent } from './component';

export class ESPParserTool extends Tool {
  constructor() {
    super('esp_parser', ESPParserComponent);
  }

  public override open_link(url: URL): JsonValue {
    return {};
  }
}
