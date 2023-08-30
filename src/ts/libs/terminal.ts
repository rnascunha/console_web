import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// https://stackoverflow.com/a/33206814
export enum Color {
  RESET = 0,
  BOLD = 1,
  FAINT = 2,
  ITALIC = 3,
  UNDERLINE = 4,
  SLOW_BLINK = 5,
  RAPID_BLINK = 6,
  SWAP_FG_BG = 7,
  CONCEAL = 8,
  CROSSED_OUT = 9,
  DEFAULT_FONT = 10,
  ALT_FONT1 = 11,
  ALT_FONT2 = 12,
  ALT_FONT3 = 13,
  ALT_FONT4 = 14,
  ALT_FONT5 = 15,
  ALT_FONT6 = 16,
  ALT_FONT7 = 17,
  ALT_FONT8 = 18,
  ALT_FONT9 = 19,
  FRAKTUR = 20,
  BOLD_OFF = 21,
  NORMAL = 22,
  NOT_ITALIC = 23,
  UNDERLINE_OFF = 24,
  BLINK_OFF = 25,
  INVERSE_OFF = 27,
  REVEAL = 28,
  CROSSED_OUT_OFF = 29,
  FG_BLACK = 30,
  FG_RED = 31,
  FG_GREEN = 32,
  FG_YELLOW = 33,
  FG_BLUE = 34,
  FG_MAGENTA = 35,
  FG_CYAN = 36,
  FG_WHITE = 37,
  SET_FG = 38,
  FG_DEFAULT = 39,
  BG_BLACK = 40,
  BG_RED = 41,
  BG_GREEN = 42,
  BG_YELLOW = 43,
  BG_BLUE = 44,
  BG_MAGENTA = 45,
  BG_CYAN = 46,
  BG_WHITE = 47,
  SET_BG = 48,
  BG_DEFAULT = 49,
  FRAMED = 51,
  ENCIRCLED = 52,
  OVERLINED = 53,
  FRAMED_OFF = 54,
  OVERLINED_OFF = 55,
  IDEOGRAM_UNDERLINE = 60,
  IDEOGRAM_DOUBLE_UNDERLINE = 61,
  IDEOGRAM_OVERLINE = 62,
  IDEOGRAM_DOUBLE_OVERLINE = 63,
  IDEOGRAM_STRESS = 64,
  IDEGRAM_OFF = 65,
}

interface ColorOptions {
  colors?: Color[];
  bl?: boolean;
  reset?: boolean;
}

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

  public write_str(data: string, options: ColorOptions = {}): void {
    if (options.colors !== undefined)
      this._terminal.write(`\x1b[${options.colors.join(';')}m`);

    this._terminal.write(data);

    if (options.reset !== true) this._terminal.write(`\x1b[${Color.RESET}m`);
    if (options.bl !== false) this._terminal.write('\r\n');
  }

  public get terminal(): Terminal {
    return this._terminal;
  }

  public fit(): void {
    this._fit.fit();
  }
}
