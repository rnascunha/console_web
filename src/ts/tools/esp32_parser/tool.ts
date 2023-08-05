import './web-components/file';
import './web-components/file-list';

import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { ESP32ParserComponent } from './component';

export class ESP32ParserTool extends Tool {
  constructor() {
    super('esp32_parser', ESP32ParserComponent);
  }

  public override open_link(url: URL): JsonValue {
    return {};
  }
}
