import { Tool } from '../tools';
import { CoderComponent } from './component';

export class CoderTool extends Tool {
  constructor() {
    super('coder', CoderComponent);
  }
}
