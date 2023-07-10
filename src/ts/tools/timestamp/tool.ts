import { Tool } from '../tools';
import { TimestampComponent } from './component';

export class TimestampTool extends Tool {
  constructor() {
    super('timestamp', TimestampComponent);
  }
}
