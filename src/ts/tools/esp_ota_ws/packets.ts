import { type ESPFlashFile } from '../esptool/types';

export enum Command {
  START = 1,
  STATE,
  ABORT,
  //
  ERROR = 10,
}

export enum ErrorDescription {
  SUCCESS = 0,
  ALREADY_RUNNING,
  NOT_RUNNING,
  WRONG_USER,
  GET_PARTITION_ERROR,
  PACKET_SIZE_ERROR,
  INVALID_VERSION,
  SAME_VERSION,
}

export enum AbortReason {
  USER_REQUEST = 1,
  USER_DISCONNECT,
}

const STATE_PACKET_SIZE = 9;
const ERROR_PACKET_SIZE = 2;
const ABORT_PACKET_SIZE = 2;

export interface EspOTAWsStateResponse {
  commnad: Command;
  size_rcv: number;
  size_request: number;
}

export interface EspOTAWsAbortResponse {
  commnad: Command;
  reason: AbortReason;
}

export interface EspOTAWsErrorResponse {
  commnad: Command;
  error: ErrorDescription;
}

export interface EspOTAWsStartOptions {
  size: number;
  timeout: number;
  check_invalid: boolean;
  check_same: boolean;
  reboot: boolean;
}

export type EspOTAWsResponse =
  | EspOTAWsStateResponse
  | EspOTAWsAbortResponse
  | EspOTAWsErrorResponse;

function parse_state(data: Uint8Array): EspOTAWsStateResponse {
  if (data.byteLength !== STATE_PACKET_SIZE)
    throw new Error('Wrong packet size [state]');

  const dv = new DataView(data.buffer);
  return {
    commnad: Command.STATE,
    size_rcv: dv.getUint32(1, true),
    size_request: dv.getUint32(5, true),
  };
}

function parse_error(data: Uint8Array): EspOTAWsErrorResponse {
  if (data.byteLength !== ERROR_PACKET_SIZE)
    throw new Error('Wrong packet size [error]');

  return {
    commnad: Command.ERROR,
    error: data[1] as ErrorDescription,
  };
}

function parse_abort(data: Uint8Array): EspOTAWsAbortResponse {
  if (data.byteLength !== ABORT_PACKET_SIZE)
    throw new Error('Wrong packet size [abort]');

  return {
    commnad: Command.ABORT,
    reason: data[1] as AbortReason,
  };
}

export function parse(data: Uint8Array): EspOTAWsResponse {
  if (data.byteLength === 0) throw new Error('Packet too small');
  const cmd: Command = data[0] as Command;

  switch (cmd) {
    case Command.STATE:
      return parse_state(data);
    case Command.ABORT:
      return parse_abort(data);
    case Command.ERROR:
      return parse_error(data);
    default:
      console.log('not found command', data);
      throw new Error(`Command not found ${cmd as number}`);
  }
}

export function start_packet({
  size,
  timeout,
  check_invalid,
  check_same,
  reboot,
}: EspOTAWsStartOptions): Uint8Array {
  return new Uint8Array([
    Command.START,
    ...pack32(size),
    ...pack16(timeout),
    ((check_same ? 1 : 0) << 2) |
      ((check_invalid ? 1 : 0) << 1) |
      (reboot ? 1 : 0),
  ]);
}

export function state_packet(
  file: ESPFlashFile,
  offset: number,
  size: number
): Uint8Array {
  const end = Math.min(file.file.size, offset + size);
  const buffer = file.buffer?.slice(offset, end) as ArrayBuffer;
  return new Uint8Array([
    Command.STATE,
    end === file.file.size ? 1 : 0,
    ...new Uint8Array(buffer),
  ]);
}

export function abort_packet(): Uint8Array {
  return new Uint8Array([Command.ABORT]);
}

function pack32(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint32Array(args).buffer));
}

function pack16(...args: number[]): number[] {
  return Array.from(new Uint8Array(new Uint16Array(args).buffer));
}
