import { make_serial_name } from './functions';
import EventEmitter from '../../libs/event_emitter';

export type SerialState = 'open' | 'close';

interface SerialConnEvents {
  open: SerialConn;
  close: SerialConn;
  data: Uint8Array;
  sent: Uint8Array;
  error: any;
  disconnect: undefined;
}

export class SerialConn extends EventEmitter<SerialConnEvents> {
  private readonly _port: SerialPort;
  private readonly _id: number;

  private _input_stream: ReadableStream<Uint8Array> | null;
  private _reader: ReadableStreamDefaultReader<Uint8Array> | null;
  private _output_stream: WritableStream<Uint8Array> | null;

  constructor(port: SerialPort, id: number) {
    super();

    this._port = port;
    this._id = id;

    this._input_stream = null;
    this._reader = null;
    this._output_stream = null;
  }

  public async open(opt: SerialOptions): Promise<void> {
    await this._port.open(opt);
    this._input_stream = this._port.readable;
    this._reader =
      this._input_stream?.getReader() as ReadableStreamDefaultReader<Uint8Array>;
    this._output_stream = this._port.writable;
    this.emit('open', this);
    await this.read();
  }

  public async close(): Promise<void> {
    if (this.state === 'close') return;

    if (this._reader !== null) {
      await this._reader.cancel();
      this._input_stream = null;
      this._reader = null;
    }

    if (this._output_stream !== null) {
      await this._output_stream.getWriter().close();
      this._output_stream = null;
    }

    await this._port.close();
    this.emit('close', this);
  }

  public disconnect(): void {
    this._input_stream = null;
    this._reader = null;
    this._output_stream = null;
  }

  private async read(): Promise<void> {
    while (true) {
      const { value, done } = await (
        this._reader as ReadableStreamDefaultReader<Uint8Array>
      ).read();
      if (done) break;
      this.emit('data', value);
    }
  }

  public async write(data: Uint8Array): Promise<void> {
    const writer = this._output_stream?.getWriter();
    await writer?.write(data);
    writer?.releaseLock();
    this.emit('sent', data);
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return make_serial_name(this._port);
  }

  public get port(): SerialPort {
    return this._port;
  }

  public get state(): SerialState {
    return this._input_stream !== null ? 'open' : 'close';
  }

  async signals(signals: SerialOutputSignals): Promise<void> {
    await this._port.setSignals(signals);
  }
}

interface SerialListEvents {
  connect: SerialConn[];
  disconnect: SerialConn[];
  get_ports: SerialConn[];
}

export class SerialList extends EventEmitter<SerialListEvents> {
  private _ports: SerialConn[];
  private _id: number = 0;

  constructor() {
    super();
    this._ports = [];

    navigator.serial.onconnect = ev => {
      this._ports.push(new SerialConn(ev.target as SerialPort, ++this._id));
      this.emit('connect', this._ports);
    };

    navigator.serial.ondisconnect = ev => {
      const port = this._ports.find(p => p.port === ev.target);
      if (port !== undefined)
        this._ports = this._ports.filter(p => p.port !== ev.target);
      this.emit('disconnect', this._ports);
    };

    this.get_ports();
  }

  public get ports(): SerialConn[] {
    return this._ports;
  }

  public port_by_id(id: number): SerialConn | undefined {
    return this._ports.find(p => p.id === id);
  }

  public request(): void {
    navigator.serial
      .requestPort()
      .then(() => {
        this.get_ports();
      })
      .catch(() => {});
  }

  private get_ports(): void {
    navigator.serial
      .getPorts()
      .then(ports => {
        this._ports = ports.reduce((acc, port) => {
          acc.push(new SerialConn(port, ++this._id));
          return acc;
        }, Array<SerialConn>());
        this.emit('get_ports', this._ports);
      })
      .catch(() => {});
  }
}
