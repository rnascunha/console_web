import { Tool } from '../tools';
import { JSONComponent } from './component';

export class JSONTool extends Tool {
  constructor() {
    super('json', JSONComponent);
  }
}
