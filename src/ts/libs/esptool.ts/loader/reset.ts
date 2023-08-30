import type { SerialConn } from '../../serial/serial';
import { sleep } from '../../../helper/time';

export async function hard_reset(serial: SerialConn): Promise<void> {
  await serial.signals({
    dataTerminalReady: false,
    requestToSend: true,
  });
  await sleep(100);
  await serial.signals({ dataTerminalReady: true });
}

/**
 * https://github.com/espressif/esptool/blob/9585c0e70274c3543bb420851898f02644d8bc13/esptool/reset.py#L61
 * https://github.com/senseshift/esptool.ts/blob/52d054093299fbe1aa19fde98bd006fe21f42202/src/index.ts#L145
 */
export async function bootloader_reset(serial: SerialConn): Promise<void> {
  // Classic reset
  await serial.signals({
    dataTerminalReady: false,
    requestToSend: true,
  });
  await sleep(100);
  await serial.signals({
    dataTerminalReady: true,
    requestToSend: false,
  });
  await sleep(50);
  await serial.signals({
    dataTerminalReady: false,
  });
}

export async function bootloader_reset_esp32r0(
  serial: SerialConn
): Promise<void> {
  await serial.signals({
    dataTerminalReady: false,
    requestToSend: true,
  });
  await sleep(100);
  await sleep(2000);
  await serial.signals({
    dataTerminalReady: true,
    requestToSend: false,
  });
  await sleep(50);
  await serial.signals({
    dataTerminalReady: false,
  });
}

/**
 * https://github.com/espressif/esptool-js/blob/5196f9a9309acf37ac3935e2b8260dbd6ff3e86b/src/reset.ts#L19C1-L35C2
 */
export async function usb_jtag_reset(serial: SerialConn): Promise<void> {
  await serial.signals({ dataTerminalReady: false, requestToSend: false });
  await sleep(100);

  await serial.signals({ dataTerminalReady: true, requestToSend: false });
  await sleep(100);

  await serial.signals({ dataTerminalReady: false, requestToSend: true });
  await serial.signals({ requestToSend: true });

  await sleep(100);
  await serial.signals({ dataTerminalReady: false, requestToSend: false });
}
