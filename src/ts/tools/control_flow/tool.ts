import type { JsonValue } from 'golden-layout';
import { Tool } from '../tools';
import { ControlFlowComponent } from './component';

const default_address = 'flow_control.local';

export class ControlFlowTool extends Tool {
  constructor() {
    super('control_flow', ControlFlowComponent);
    this.set_state({ address: default_address });
  }

  public override open_link(url: URL): JsonValue {
    return this._state;
  }
}
