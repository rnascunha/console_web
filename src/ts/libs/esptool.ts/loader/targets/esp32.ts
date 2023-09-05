/* eslint-disable */

abstract class Chip {
  abstract get name(): string;
}

export class ESP32 extends Chip {
  // private readonly IMAGE_CHIP_ID = 0;
  // private readonly EFUSE_RD_REG_BASE = 0x3ff5a000;
  // private readonly DR_REG_SYSCON_BASE = 0x3ff66000;
  // private readonly UART_CLKDIV_REG = 0x3ff40014;
  // private readonly UART_CLKDIV_MASK = 0xfffff;
  // private readonly UART_DATE_REG_ADDR = 0x60000078;
  // private readonly XTAL_CLK_DIVIDER = 1;

  get name(): string {
    return 'esp32';
  }
}
