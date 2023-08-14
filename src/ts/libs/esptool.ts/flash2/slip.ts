/**
 * https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/serial-protocol.html
 */
import * as type from './types';
import { ESPFlashError, ErrorCode } from './error';

const PACKET_BORDER = 0xc0;
const HEADER_RESPONSE_SIZE = 8;
const CHECKSUM_SEED = 0xef;

const replacer: Record<number, number[]> = {
  0xc0: [0xdb, 0xdc],
  0xdb: [0xdb, 0xdd],
};

interface DataPayload {
  data: Uint8Array;
  checksum: number;
}

// const stub_only_commands: type.Commands[] = [
//   Commands.ERASE_FLASH,
//   Commands.ERASE_REGION,
//   Commands.READ_FLASH,
//   Commands.RUN_USER_CODE,
// ];

const checksum_need_command: type.Command[] = [
  type.Command.MEM_DATA,
  type.Command.FLASH_DATA,
  type.Command.FLASH_DEFL_DATA,
];

function bytes_to_uint16(b0: number, b1: number): number {
  return (b1 << 8) | b0;
}

function uint16_to_bytes(size: number): number[] {
  return [size & 0xff, (size >> 8) & 0xff];
}

function checksum(data: Uint8Array, seed = CHECKSUM_SEED): number {
  for (const b of data) {
    seed ^= b;
  }
  return seed;
}

function decode(data: number[]): number[] | ESPFlashError {
  if (data[0] !== PACKET_BORDER || data[data.length - 1] !== PACKET_BORDER)
    return new ESPFlashError(ErrorCode.INVALID_BORDER_BYTE);

  const ans: number[] = [];
  for (let i = 1; i < data.length - 1; ++i) {
    if (data[i] === 0xdb) {
      ++i;
      if (i < data.length - 1) return new ESPFlashError(ErrorCode.PARSE_ERROR);
      switch (data[i]) {
        case 0xdc:
          ans.push(0xc0);
          break;
        case 0xdd:
          ans.push(0xdb);
          break;
        default:
          return new ESPFlashError(ErrorCode.PARSE_ERROR);
      }
    } else ans.push(data[i]);
  }
  return ans;
}

function encode(data: number[]): number[] {
  const ans: number[] = [PACKET_BORDER];
  data.forEach(d => {
    if (d in replacer) ans.push(...replacer[d]);
    else ans.push(d);
  });
  ans.push(PACKET_BORDER);
  return ans;
}

function parse_response(
  data_raw: number[],
  is_stub: boolean
): type.Response | ESPFlashError {
  const data = decode(data_raw);

  if (data instanceof ESPFlashError) return data;
  if (data.length < HEADER_RESPONSE_SIZE)
    return new ESPFlashError(ErrorCode.PACKET_TOO_SMALL);
  if (data[0] !== type.Direction.RESPONSE)
    return new ESPFlashError(ErrorCode.WRONG_DIRECTION);

  const command = data[1] as type.Command;
  const size = bytes_to_uint16(data[2], data[3]);
  const payload_received = data.length - HEADER_RESPONSE_SIZE;
  if (size !== payload_received) {
    return new ESPFlashError(ErrorCode.SIZE_NOT_MATCH);
  }

  const value = unpack32([data[4], data[5], data[6], data[7]]);

  const status_size = is_stub ? 2 : 4;
  if (size < status_size) return new ESPFlashError(ErrorCode.SIZE_NOT_MATCH);

  const payload = data.slice(HEADER_RESPONSE_SIZE, -status_size);
  const status_data = data.slice(-status_size);

  return {
    direction: type.Direction.RESPONSE,
    command,
    size,
    value,
    data: payload,
    status: {
      status: status_data[0] as type.Status,
      error: status_data[1],
    },
  };
}

export function parse(
  raw_data: Uint8Array,
  is_stub: boolean,
  remain: number[] = []
): type.Packets {
  const data = [...remain, ...Array.from(raw_data)];
  const packets: type.Response[] = [];
  let curr = [];
  for (let i = 0; i < data.length; ++i) {
    if (curr.length === 0 && data[i] !== PACKET_BORDER) continue;
    curr.push(data[i]);
    if (data[i] === PACKET_BORDER && curr.length > 1) {
      if (curr.length === 2) {
        // [0xC0, 0xC0]
        curr.pop();
        continue;
      }
      const ans = parse_response(curr, is_stub);
      if (!(ans instanceof ESPFlashError)) packets.push(ans);
      else console.warn(ans.message);
      curr = [];
    }
  }

  return {
    packets,
    remain: curr,
  };
}

function payload_data(data: Uint8Array, sequence: number): DataPayload {
  const buffer = new ArrayBuffer(16 + data.byteLength);

  const dv = new DataView(buffer);
  dv.setUint32(0, data.length, true);
  dv.setUint32(4, sequence, true);
  dv.setUint32(8, 0, true);
  dv.setUint32(12, 0, true);

  const d = new Uint8Array(buffer);
  d.set(data, 16);
  const cs = checksum(data, CHECKSUM_SEED);

  return {
    data: d,
    checksum: cs,
  };
}

export function command(
  command: type.Command,
  data: Uint8Array,
  checksum: number = 0
): Uint8Array {
  const comm = [
    type.Direction.COMMAND,
    command,
    ...uint16_to_bytes(data.length),
    checksum,
    0,
    0,
    0,
    ...Array.from(data),
  ];

  return new Uint8Array(encode(comm));
}

export function command_data(
  comm: type.Command,
  data: Uint8Array,
  sequence: number
): Uint8Array {
  if (!checksum_need_command.includes(comm)) throw new Error('No command data');

  const payload = payload_data(data, sequence);
  return command(comm, payload.data, payload.checksum);
}

export function pack16(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint16Array(args).buffer));
}

export function pack32(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint32Array(args).buffer));
}

function unpack32(arg: number[]): number {
  return new DataView(new Uint8Array(arg).buffer).getUint32(0, true);
}
