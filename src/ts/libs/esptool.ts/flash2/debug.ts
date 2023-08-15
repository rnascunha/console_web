import * as type from './types';

export function chip_name(chip_id: number): string {
  if (chip_id in type.chips) return type.chips[chip_id].name;

  return `0x${chip_id.toString(16)}`;
}

export function mac_string(mac: number[]): string {
  if (mac.length !== 6) return '';

  const out = [];
  for (let i = 0; i < 6; ++i) out.push(mac[i].toString(16).padStart(2, '0'));
  return out.join(':');
}
