export enum Command {
  CONFIG = 1,
  STATE,
  OPEN_VALVE,
  CLOSE_VALVE,
  // START_CONTROL_VOLUME,
  // DATA_CONTROL_VOLUME,
  // END_CONTROL_VOLUME,
  //
  ERROR = 10,
}

export enum ErrorDescription {
  NOT_DEFINE = 0,
  SIZE_PACKET_NOT_MATCH,
  ARGUMENT_ERROR,
  ERROR_READING,
  COMMAND_NOT_FOUND,
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
  [Command.OPEN_VALVE]: () => make_packet(Command.OPEN_VALVE, 1),
  [Command.CLOSE_VALVE]: () => make_packet(Command.CLOSE_VALVE, 0),
  [Command.ERROR]: () => {
    throw new Error('packet does not exist');
  },
};

export enum State {
  OPEN = 0,
  CLOSE,
}

export interface ControlFlowResponse {
  command: Command;
  state?: State;
  pulses?: number;
  volume?: number;
  k?: number;
  version?: number;
}

export interface ControlFlowResponseError {
  command: Command;
  response: Command;
  error: ErrorDescription;
}

function parse_state(data: Uint8Array): ControlFlowResponse {
  if (data.byteLength !== STATE_PACKET_SIZE)
    throw new Error('Wrong packet size [state]');

  const dv = new DataView(data.buffer);
  return {
    command: Command.STATE,
    state: data[1] as State,
    pulses: dv.getInt32(2, true),
    volume: dv.getFloat64(6, true),
  };
}

function parse_config(data: Uint8Array): ControlFlowResponse {
  if (data.byteLength !== CONFIG_PACKET_SIZE)
    throw new Error('Wrong packet size [config]');

  const dv = new DataView(data.buffer);
  return {
    command: Command.CONFIG,
    version: dv.getUint32(1, true),
    k: dv.getUint32(5, true),
  };
}

function parse_error(data: Uint8Array): ControlFlowResponseError {
  if (data.byteLength !== ERROR_PACKET_SIZE)
    throw new Error('Wrong packet size [error]');

  return {
    command: Command.ERROR,
    response: data[1] as Command,
    error: data[2] as ErrorDescription,
  };
}

export function parse(
  data: Uint8Array
): ControlFlowResponse | ControlFlowResponseError {
  if (data.byteLength === 0) throw new Error('Packet too small');
  const resp: ControlFlowResponse = { command: data[0] as Command };

  switch (resp.command) {
    case Command.STATE:
      return parse_state(data);
    case Command.CONFIG:
      return parse_config(data);
    case Command.ERROR:
      return parse_error(data);
    default:
      throw new Error(`Command not found ${resp.command as number}`);
  }
}
