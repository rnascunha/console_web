/**
 * https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/serial-protocol.html
 */
import * as type from './types';
import { ESPFlashError, ErrorCode } from './error';
import { pack16, pack32, unpack32 } from '../../../helper/pack';

const PACKET_BORDER = 0xc0;
const HEADER_RESPONSE_SIZE = 8;
const CHECKSUM_SEED = 0xef;

const replacer: Record<number, number[]> = {
  0xc0: [0xdb, 0xdc],
  0xdb: [0xdb, 0xdd],
};

interface SplitPacket {
  packet?: number[];
  remain: number[];
}

interface SplitPackets {
  packets: number[][];
  remain: number[];
}

function bytes_to_uint16(b0: number, b1: number): number {
  return (b1 << 8) | b0;
}

export function empty_response(
  command: type.Command,
  is_stub: boolean
): type.Response {
  return {
    direction: type.Direction.RESPONSE,
    command,
    size: is_stub ? 2 : 4,
    value: 0,
    data: [],
    status: {
      status: type.Status.SUCCESS,
    },
  };
}

export function checksum(
  data: number[] | Uint8Array,
  seed = CHECKSUM_SEED
): number {
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
      if (i >= data.length - 1) return new ESPFlashError(ErrorCode.PARSE_ERROR);
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

export function parse_response(
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

  const status_size = is_stub ? 2 : 4;
  if (size < status_size) return new ESPFlashError(ErrorCode.PAYLOAD_TOO_SMALL);

  const value =
    size > status_size ? 0 : unpack32([data[4], data[5], data[6], data[7]]);
  const payload = data.slice(-size, -status_size);
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
  raw_data: Uint8Array | number[],
  is_stub: boolean,
  remain: number[] = []
): type.Packets {
  const splited = split(raw_data, remain);

  const packets: type.Response[] = [];
  splited.packets.forEach(p => {
    const ans = parse_response(p, is_stub);
    if (ans instanceof ESPFlashError) {
      console.warn(`Parse error: ${ans.message}`, p);
      return;
    }
    packets.push(ans);
  });

  return {
    packets,
    remain: splited.remain,
  };
}

export function split(
  raw_data: Uint8Array | number[],
  remain: number[] = []
): SplitPackets {
  const data = [...remain, ...Array.from(raw_data)];
  const packets: number[][] = [];
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
      packets.push(curr);
      curr = [];
    }
  }

  return {
    packets,
    remain: curr,
  };
}

export function split_one(
  raw_data: Uint8Array | number[],
  remain: number[] = []
): SplitPacket {
  const data = [...remain, ...Array.from(raw_data)];
  const begin = data.indexOf(PACKET_BORDER);
  if (begin === -1)
    return {
      remain: [],
    };
  const end = data.indexOf(PACKET_BORDER, begin + 1);
  if (end === -1)
    return {
      remain: data.slice(begin),
    };

  if (end - begin === 1)
    return {
      remain: data.slice(end),
    };

  return {
    packet: data.slice(begin, end + 1),
    remain: data.slice(end + 1),
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
    ...pack16(data.length),
    ...pack32(checksum),
    ...Array.from(data),
  ];

  return new Uint8Array(encode(comm));
}
