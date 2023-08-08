import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export class DataTerminal {
  private readonly _terminal: Terminal;
  private readonly _fit: FitAddon;

  constructor(container?: HTMLElement) {
    this._terminal = new Terminal();
    this._fit = new FitAddon();

    this._terminal.loadAddon(this._fit);

    if (container !== undefined) this.open(container);
  }

  public open(container: HTMLElement): void {
    this._terminal.open(container);
    this._fit.fit();
  }

  public write(data: Uint8Array): void {
    this._terminal.write(data);
  }

  public write_str(data: string): void {
    this._terminal.write(new TextEncoder().encode(data));
  }

  public get terminal(): Terminal {
    return this._terminal;
  }

  public fit(): void {
    this._fit.fit();
  }
}
