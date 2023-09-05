import type { JsonValue } from 'golden-layout';

export abstract class Tool {
  private readonly _name: string;
  private readonly _component: any;
  protected _state: JsonValue = {};

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

  public set_state(state: JsonValue): void {
    this._state = state;
  }

  public open(): JsonValue {
    return this._state;
  }

  public open_link?(url: URL): JsonValue;
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
