export enum Command {
  CONFIG = 1,
  STATE,
  OPEN_VALVE,
  CLOSE_VALVE,

  //
  ERROR = 10,
}

export enum ErrorDescription {
  NOT_DEFINE = 0,
  SIZE_PACKET_NOT_MATCH,
  ARGUMENT_ERROR,
  ERROR_READING,
  COMMAND_NOT_FOUND,
  ALREADY_OPENED,
  SAFER_TIMER_IDLE,
}

const ERROR_PACKET_SIZE = 3;
const CONFIG_PACKET_SIZE = 9;
const STATE_PACKET_SIZE = 14;

function make_packet(cmd: Command, ...args: number[]): Uint8Array {
  return new Uint8Array([cmd, ...args]);
}

export const packets: Record<Command, () => Uint8Array> = {
  [Command.CONFIG]: () => make_packet(Command.CONFIG),
  [Command.STATE]: () => make_packet(Command.STATE),
  [Command.OPEN_VALVE]: () =>
    make_packet(Command.OPEN_VALVE, 1, 1, 0, 0, 0, 0, 0, 0, 0),
  [Command.CLOSE_VALVE]: () => make_packet(Command.CLOSE_VALVE),
  [Command.ERROR]: () => {
    throw new Error('packet does not exist');
  },
};

export enum State {
  OPEN = 0,
  CLOSE = 1,
}

export interface ControlFlowStateResponse {
  state: State;
  pulses: number;
  limit: number;
  freq: number;
}

export interface ControlFlowConfigResponse {
  version: number;
  k: number;
}

export interface ControlFlowErrorResponse {
  command: Command;
  response: Command;
  error: ErrorDescription;
}

export type ControlFlowResponse =
  | ControlFlowStateResponse
  | ControlFlowConfigResponse
  | ControlFlowErrorResponse;

function parse_state(data: Uint8Array): ControlFlowStateResponse {
  if (data.byteLength !== STATE_PACKET_SIZE)
    throw new Error('Wrong packet size [state]');

  const dv = new DataView(data.buffer);
  return {
    state: data[1] as State,
    pulses: dv.getInt32(2, true),
    limit: dv.getInt32(6, true),
    freq: dv.getInt32(10, true),
  };
}

function parse_config(data: Uint8Array): ControlFlowConfigResponse {
  if (data.byteLength !== CONFIG_PACKET_SIZE)
    throw new Error('Wrong packet size [config]');

  const dv = new DataView(data.buffer);
  return {
    version: dv.getUint32(1, true),
    k: dv.getUint32(5, true),
  };
}

function parse_error(data: Uint8Array): ControlFlowErrorResponse {
  if (data.byteLength !== ERROR_PACKET_SIZE)
    throw new Error('Wrong packet size [error]');

  return {
    command: Command.ERROR,
    response: data[1] as Command,
    error: data[2] as ErrorDescription,
  };
}

export function parse(data: Uint8Array): ControlFlowResponse {
  if (data.byteLength === 0) throw new Error('Packet too small');
  const cmd: Command = data[0] as Command;

  switch (cmd) {
    case Command.STATE:
      return parse_state(data);
    case Command.CONFIG:
      return parse_config(data);
    case Command.ERROR:
      return parse_error(data);
    default:
      console.log('not found command', data);
      throw new Error(`Command not found ${cmd as number}`);
  }
}
