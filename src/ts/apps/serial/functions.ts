import * as serialJSON from './usb_filtered.json';
import type { SerialConn, SerialList } from './serial';
import { sleep } from '../../helper/time';

export interface SerialPortInfo {
  vendorID: string;
  vendorName: string | undefined;
  productID: string;
  productName: string | undefined;
}

export function is_serial_supported(): boolean {
  return 'serial' in navigator;
}

export function get_serial_info(port: SerialPort): SerialPortInfo {
  const { usbProductId, usbVendorId } = port.getInfo();
  const vID: string = usbVendorId?.toString(16) as string;
  const pID: string = usbProductId?.toString(16) as string;
  const vName = (serialJSON as Record<string, any>)[vID]?.name;
  const pName = (serialJSON as Record<string, any>)[vID]?.devices[pID];

  return {
    vendorID: vID,
    productID: pID,
    vendorName: vName,
    productName: pName,
  };
}

export function make_serial_name(port: SerialPort): string {
  const info = get_serial_info(port);
  if (info.productName !== undefined) return info.productName;

  if (info.vendorName !== undefined)
    return `${info.vendorName} [${info.productID}]`;

  return `Generic [${info.vendorID}/${info.productID}]`;
}

export async function esp32_signal_reset(port: SerialConn): Promise<void> {
  await port.signals({ dataTerminalReady: false, requestToSend: true });
  await sleep(100);
  await port.signals({ dataTerminalReady: true });
}

function update_ports(ports: SerialConn[], select: HTMLSelectElement): void {
  const selected = +select.value;
  select.innerHTML = '';
  if (ports.length === 0) {
    select.appendChild(new Option('No ports', '0'));
    select.disabled = true;
    return;
  }
  select.disabled = false;
  ports.forEach(port =>
    select.appendChild(
      new Option(
        make_serial_name(port.port),
        port.id.toString(),
        undefined,
        port.id === selected
      )
    )
  );
}

export function install_serial_events(
  list: SerialList,
  select: HTMLSelectElement
): void {
  list.on('connect', () => {
    update_ports(list.ports, select);
  });
  list.on('disconnect', () => {
    update_ports(list.ports, select);
  });
  list.on('get_ports', () => {
    update_ports(list.ports, select);
  });
}
