import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { DataTerminal } from '../libs/terminal';

export class TerminalComponent extends ComponentBase {
  private readonly _terminal: DataTerminal;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._terminal = new DataTerminal(this.rootHtmlElement);

    this.title = 'Terminal';

    container.on('open', () => {
      setTimeout(() => {
        this._terminal.fit();
      }, 1);
      this.container.on('resize', () => {
        this._terminal.fit();
      });
    });
  }

  public get terminal(): DataTerminal {
    return this._terminal;
  }
}
