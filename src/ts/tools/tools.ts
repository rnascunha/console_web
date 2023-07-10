import type { JsonValue } from 'golden-layout';

export class Tool {
  private readonly _name: string;
  private readonly _component: any;
  private _state: JsonValue = {};

  constructor(name: string, component: any) {
    this._name = name;
    this._component = component;
  }

  get name(): string {
    return this._name;
  }

  get component(): any {
    return this._component;
  }

  set_state(state: JsonValue): void {
    this._state = state;
  }

  open(): JsonValue {
    return JSON.stringify(this._state);
  }
}

export class ToolList {
  private readonly _tools: Record<string, Tool> = {};

  constructor(tools: Tool[]) {
    tools.forEach((tool: Tool) => {
      this._tools[tool.name] = tool;
    });
  }

  tool(name: string): Tool | undefined {
    return this._tools[name];
  }

  get tools(): Tool[] {
    return Object.values(this._tools);
  }
}
