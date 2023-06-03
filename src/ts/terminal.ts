import {Terminal} from "xterm";
import { FitAddon } from "xterm-addon-fit";

export class DataTerminal {
  private _terminal:Terminal;
  private _fit:FitAddon;

  constructor(container?:HTMLElement) {
    this._terminal = new Terminal();
    this._fit = new FitAddon();

    this._terminal.loadAddon(this._fit);

    if (container)
      this.open(container);
  }

  public open(container:HTMLElement) {
    this._terminal.open(container);
    this._fit.fit();
  }

  public write(data:Uint8Array) {
    this._terminal.write(data);
  }

  public get terminal() {
    return this._terminal;
  }

  public fit() {
    this._fit.fit();
  }
}