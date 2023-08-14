const checksum_seed = 0xef;
const start_end_byte = 0xc0;

interface Packets {
  packets: number[][];
  remain: number[];
}

interface Packet {
  packet: number[];
  remain: number[];
}

interface DecodedPacket {
  error: boolean;
  error_message?: string;
  direction?: number;
  op?: number;
  size?: number;
  value?: number;
  data?: Uint8Array;
  status?: number;
  status_error?: number;
}

export function encode(buffer: number[]): number[] {
  const encoded = [start_end_byte];
  for (const byte of buffer) {
    switch (byte) {
      case 0xdb:
        encoded.push(0xdb, 0xdd);
        break;
      case 0xc0:
        encoded.push(0xdb, 0xdc);
        break;
      default:
        encoded.push(byte);
    }
  }
  encoded.push(start_end_byte);
  return encoded;
}

export function split_packet(
  data: number[],
  remain: number[] | undefined = undefined
): Packets {
  const packets = [];
  let i = 0;
  let in_packet = remain !== undefined;
  let packet = remain !== undefined ? remain : [];
  for (; i < data.length; i++) {
    if (data[i] === 0xc0) {
      // is a control character
      if (in_packet) {
        packet.push(data[i]);
        packets.push(packet);
        in_packet = false;
        packet = [];
      } else {
        packet = [data[i]];
        in_packet = true;
      }
    } else if (in_packet) {
      // is not a control character
      packet.push(data[i]);
    }
  }
  return { packets, remain: packet };
}

export function read_packet(
  data: number[],
  remain: number[] | undefined = undefined
): Packet {
  let i = 0;
  let in_packet = remain !== undefined;
  let packet = remain !== undefined ? remain : [];
  for (; i < data.length; i++) {
    if (data[i] === 0xc0) {
      // is a control character
      if (in_packet) {
        packet.push(data[i]);
        return { packet, remain: data.slice(i + 1, data.length) };
      } else {
        packet = [data[i]];
        in_packet = true;
      }
    } else if (in_packet) {
      // is not a control character
      packet.push(data[i]);
    }
  }
  return { packet: [], remain: packet };
}

/**
 * Just remove the beggining and end control byte (0xC0);
 */
export function payload(buffer: number[]): number[] | boolean {
  if (
    buffer.length !== 0 ||
    buffer[0] !== 0xc0 ||
    buffer[buffer.length - 1] !== 0xc0
  ) {
    return false;
  }

  return buffer.slice(1, buffer.length - 1);
}

export function decode(
  buffer: number[],
  is_stub: boolean = false
): DecodedPacket {
  if (buffer[0] !== 0xc0 || buffer[buffer.length - 1] !== 0xc0) {
    return { error: true, error_message: 'missing control bytes' };
  }

  const decoded = [];
  for (let i = 1; i < buffer.length - 1; i++) {
    if (buffer[i] === 0xdb) {
      i++;
      if (i < buffer.length - 1) {
        switch (buffer[i]) {
          case 0xdd:
            decoded.push(0xdb);
            break;
          case 0xdc:
            decoded.push(0xc0);
            break;
          default:
            decoded.push(0xdb, buffer[i]);
            break;
        }
      } else {
        decoded.push(0xdb);
      }
    } else {
      decoded.push(buffer[i]);
    }
  }

  if (
    decoded.length <
    (is_stub ? 10 : 12) /* minimum response header + status byte */
  ) {
    return { error: true, error_message: 'packet too small' };
  }

  if (decoded[0] !== 0x01 /* response */) {
    return { error: true, error_message: 'not a response' };
  }

  const arr = new Uint8Array(decoded);
  const view = new DataView(arr.buffer);
  const data = arr.slice(8);
  const status = data[data.length - (is_stub ? 2 : 4)];
  const status_error = data[data.length - (is_stub ? 1 : 3)];

  return {
    error: false,
    direction: view.getUint8(0),
    op: view.getUint8(1),
    size: view.getUint16(2, true),
    value: view.getUint32(4, true),
    data,
    status,
    status_error,
  };
}

export function encoded_command(
  op: number,
  buffer: number[],
  checksum: number = 0
): Uint8Array {
  return new Uint8Array(encode(command(op, buffer, checksum)));
}

export function command(op: number, buffer: number[], checksum = 0): number[] {
  return [0x00, op, ...pack16(buffer.length), ...pack32(checksum), ...buffer];
}

export function checksum(data: number[], seed = checksum_seed): number {
  for (const b of data) {
    seed ^= b;
  }
  return seed;
}

export function pack16(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint16Array(args).buffer));
}

export function pack32(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint32Array(args).buffer));
}
