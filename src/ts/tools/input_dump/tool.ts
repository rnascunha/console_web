import { Tool } from '../tools';
import { InputDockDumpComponent } from './component';

export class InputDumpTool extends Tool {
  constructor() {
    super('input_dump', InputDockDumpComponent);
    this.set_state({ data: '', breakline: 8, hide: [] });
  }
}
