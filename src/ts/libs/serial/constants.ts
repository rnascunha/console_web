export const serialBaudrate: number[] = [
  9600, 19200, 38400, 57600, 115200, 230400, 460800, 576000, 921600,
];
export const serialDataBits = [7, 8];
export const serialFlowControl: FlowControlType[] = ['none', 'hardware'];
export const serialParity: ParityType[] = ['none', 'even', 'odd'];
export const serialStopBits = [1, 2];

export const serialDefaults: SerialOptions = {
  baudRate: 115200,
  dataBits: 8,
  flowControl: 'none',
  parity: 'none',
  stopBits: 1,
};
