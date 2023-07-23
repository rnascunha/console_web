import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { TimestampComponent } from './component';
import type { TimestampOptions } from './types';

export class TimestampTool extends Tool {
  constructor() {
    super('timestamp', TimestampComponent);
  }

  public override open_link(url: URL): JsonValue {
    const state: TimestampOptions = {
      clocks: [],
      timestamp: [],
    };
    url.searchParams.forEach((value, key) => {
      switch (key) {
        case 'clocks':
          state.clocks = value.split(',');
          break;
        case 'timestamp':
          state.timestamp = value.split(';').map(v => {
            const t = v.split(',');
            return { timestamp: +t[1], timezone: t[0] };
          });
          break;
      }
    });
    return state;
  }
}
