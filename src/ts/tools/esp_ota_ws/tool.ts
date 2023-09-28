import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { EspOTAWsComponent } from './component';

export class EspOTAWs extends Tool {
  constructor() {
    super('esp_ota_ws', EspOTAWsComponent);
  }

  public override open_link(url: URL): JsonValue {
    return this._state;
  }
}
