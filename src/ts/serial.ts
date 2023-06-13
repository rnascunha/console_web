import DataDisplay from './components/data-display/data-display';
import EventEmitter from './event_emitter';
import { sleep } from './helper';
import { ParseUntilTimeout,
         ParseData } from './stream_parser';
import * as serialJSON from './usb_filtered.json';
import { DataTerminal } from './terminal';

export function support_serial() {
  return 'serial' in navigator;
}

interface SerialPortInfo {
  vendorID: string,
  vendorName: string|undefined,
  productID: string,
  productName: string|undefined
};

function get_serial_info(port:SerialPort) : SerialPortInfo {
  const {usbProductId, usbVendorId} = port.getInfo();
  const vID:string = usbVendorId?.toString(16) as string;
  const pID:string = usbProductId?.toString(16) as string;
  const vName = (serialJSON as Record<string, any>)[vID]?.name;
  const pName = (serialJSON as Record<string, any>)[vID]?.devices[pID];

  return {
    vendorID: vID,
    productID: pID,
    vendorName: vName,
    productName: pName
  }
}

function make_serial_name(port:SerialPort) : string {
  const info = get_serial_info(port);
  if (info.productName)
    return info.productName as string;
  
  if (info.vendorName) {
    return `${info.vendorName} [${info.productID}]`;
  }

  return `Generic [${info.vendorID}/${info.productID}]`;
}

type SerialState = 'open' | 'close';

const SerialBaurate = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 576000, 921600];
const SerialDataBits = [7, 8];
const SerialFlowControl = ['none', 'hardware'];
const SerialParity = ['none', 'even', 'odd'];
const SerialStopBits = [1, 2];

const SerialDefaults = {
  baudRate: 115200,
  dataBits: 8,
  flowControl: 'none',
  parity: 'none',
  stopBits: 1
};

interface SerialConnEvents {
  'open': SerialConn,
  'close': SerialConn,
  'data': Uint8Array,
  'error': any,
  'disconnect': undefined
};

async function esp32_signal_reset(port:SerialConn) {
  await port.signals({dataTerminalReady: false, requestToSend: true});
  await sleep(100);
  await port.signals({dataTerminalReady: true});
}

export class SerialConn extends EventEmitter<SerialConnEvents>{
  private _port:SerialPort;
  private _id:number;

  private _input_stream:ReadableStream<Uint8Array>|null;
  private _reader:ReadableStreamDefaultReader<Uint8Array>|null;
  private _output_stream:WritableStream<Uint8Array>|null;

  constructor(port:SerialPort, id:number) {
    super();

    this._port = port;
    this._id = id;

    this._input_stream = null;
    this._reader = null;
    this._output_stream = null;
  }

  public async open(opt:SerialOptions) : Promise<void> {
    await this._port.open(opt);
    this._input_stream = this._port.readable;
    this._reader = this._input_stream?.getReader() as ReadableStreamDefaultReader<Uint8Array>;
    this._output_stream = this._port.writable;
    this.emit('open', this);
    return await this.read();
  }

  public async close() {
    if (this.state == 'close')
      return;

    if (this._reader) {
      await this._reader.cancel();
      this._input_stream = null;
      this._reader = null;
    }

    if (this._output_stream) {
      await this._output_stream.getWriter().close();
      this._output_stream = null;
    }

    await this._port.close();
    this.emit('close', this);
  }

  public disconnect() {
    this._input_stream = null;
    this._reader = null;
    this._output_stream = null;
  }

  private async read() {
    while (true) {
      const { value, done } = await (this._reader as ReadableStreamDefaultReader<Uint8Array>).read();
      if (done)
        break;
      this.emit('data', value);
    }
  }

  public async write(data:string) {
    const writer = this._output_stream?.getWriter();
    await writer?.write(new TextEncoder().encode(data));
    writer?.releaseLock();
  }

  public get id() : number {
    return this._id;
  }

  public get name() : string {
    return make_serial_name(this._port);
  }

  public get port() : SerialPort {
    return this._port;
  }

  public get state() : SerialState {
    return this._input_stream ? 'open' : 'close';
  }

  async signals(signals:SerialOutputSignals) {
    await this._port.setSignals(signals);
  }
}

const template = function(){
  const template = document.createElement('template');
  template.innerHTML = `
    <div>
      <div>
        <select class='sel-serial-conn serial-baudrate'></select>
        <select class='sel-serial-conn serial-databits'></select>
        <select class='sel-serial-conn serial-flowcontrol'></select>
        <select class='sel-serial-conn serial-parity'></select>
        <select class='sel-serial-conn serial-stopbits'></select>
        <button class=serial-connect>Open</button>
        <button class=serial-data-clear>Clear</button>
        <button class='serial-console btn-not-pressed'>Console</button>
      </div>
      <div>
        <input class=serial-input placeholder=Data>
        <button class=serial-send>Send</button>
        <button class="serial-signal-button serial-DTR">DTR</button>
        <button class="serial-signal-button serial-RTS">RTS</button>
        <button class="serial-signal-button serial-BREAK">BREAK</button>
        <span class='serial-get-signal serial-CTS'>CTS</span>
        <span class='serial-get-signal serial-DCD'>DCD</span>
        <span class='serial-get-signal serial-DSR'>DSR</span>
        <span class='serial-get-signal serial-RI'>RI</span>
        <button class=serial-btn-signal>&#x27F3;</button>
        <button class='serial-signal-button serial-signal-reset'>Reset</button>
      </div>
    </div>
    <display-data class=data></display-data>
  `;

  function make_select(mclass:string, values:Array<any>, mdefault:any) {
    const el = template.content.querySelector(mclass);
    values.forEach(v =>
    el?.appendChild(new Option(`${v}`, `${v}`, v === mdefault)));  
  }
  make_select('.serial-baudrate', SerialBaurate, SerialDefaults.baudRate);
  make_select('.serial-databits', SerialDataBits, SerialDefaults.dataBits);
  make_select('.serial-flowcontrol', SerialFlowControl, SerialDefaults.flowControl);
  make_select('.serial-parity', SerialParity, SerialDefaults.parity);
  make_select('.serial-stopbits', SerialStopBits, SerialDefaults.stopBits);

  return template;
}()

interface SerialViewEvents {
  console: boolean,
  close_console: undefined,
  disconnect: undefined
};

export class SerialView extends EventEmitter<SerialViewEvents> {
  private _port:SerialConn;
  private _container:HTMLElement;
  private _btn_open:HTMLButtonElement;
  private _data:DataDisplay;
  private _out_data:HTMLInputElement;
  private _parser:ParseUntilTimeout;

  constructor(port:SerialConn) {
    super();

    this._port = port;
    
    this._container = document.createElement('div');
    this._container.classList.add('golden-content');
    this._container.appendChild(template.content.cloneNode(true));

    this._btn_open = this._container.querySelector('.serial-connect') as HTMLButtonElement;
    this._data = this._container.querySelector('.data') as DataDisplay;
    this._out_data = this._container.querySelector('.serial-input') as HTMLInputElement;
    
    this._parser = new ParseUntilTimeout(100);

    this._port.on('open', () => {
      this.opened()
      this._parser.start();
    });
    this._port.on('close', () => {
      this.closed()
      this._parser.stop();
    });
    this._port.on('error', error => this.error(error));
    this._port.on('data', data => {
      this._parser.process(data)
    });
    this._port.on('disconnect', () => this.disconnect())

    this._parser.on('data', d => this.data(d));

    this.closed();

    this._btn_open.onclick = async () => {
      try {
        if (this._port.state == 'close') {
          await this._port.open({
            baudRate: +(this._container.querySelector('.serial-baudrate') as HTMLSelectElement).value,
            dataBits: +(this._container.querySelector('.serial-databits') as HTMLSelectElement).value,
            flowControl: ((this._container.querySelector('.serial-flowcontrol') as HTMLSelectElement).value as FlowControlType),
            parity: ((this._container.querySelector('.serial-parity') as HTMLSelectElement).value as ParityType),
            stopBits: +(this._container.querySelector('.serial-stopbits') as HTMLSelectElement).value
          });
        } else if (this._port.state == 'open') {
          await this._port.close();
        }
      } catch(e) {
        this._data.error(`${e}`);
        this.disconnect();
      }
    }

    // Read signal
    (this._container.querySelector('.serial-btn-signal') as HTMLButtonElement).onclick = () => {
      function set_signal(s:SerialInputSignals, mclass:string, property:keyof SerialInputSignals, container:HTMLElement) {
        if (s[property])
          container.querySelector(mclass)?.classList.add('signal-set');
        else
          container.querySelector(mclass)?.classList.remove('signal-set');
      }
      this._port.port.getSignals().then(s => {
        set_signal(s, '.serial-CTS', 'clearToSend', this._container);
        set_signal(s, '.serial-DCD', 'dataCarrierDetect', this._container);
        set_signal(s, '.serial-DSR', 'dataSetReady', this._container);
        set_signal(s, '.serial-RI', 'ringIndicator', this._container);
      });
    }

    // Send data
    (this._container.querySelector('.serial-send') as HTMLButtonElement).onclick = () => {
      if (this._out_data.value.length > 0) {
        this._port.write(this._out_data.value);
        this._data.send(this._out_data.value,
                        this._out_data.value.length,
                        this._out_data.value);
      }
    }

    // Clear data
    (this._container.querySelector('.serial-data-clear') as HTMLButtonElement).onclick = () => {
      this._data.clear();
    }

    // Reset ESP32 device
    (this._container.querySelector('.serial-signal-reset') as HTMLButtonElement).onclick = () => {
      esp32_signal_reset(this._port);
    }

    // Open/Close serial console
    const btn_console = this._container.querySelector('.serial-console') as HTMLButtonElement;
    (this._container.querySelector('.serial-console') as HTMLButtonElement).onclick = ev => {
      if (btn_console.classList.contains('btn-pressed')) {
        this.emit('console', false);
      } else {
        btn_console.classList.remove('btn-not-pressed');
        btn_console.classList.add('btn-pressed');
        this.emit('console', true);
      }
    }

    this.on('close_console', () => {
      btn_console.classList.add('btn-not-pressed');
      btn_console.classList.remove('btn-pressed');
    });
  }

  get container() : HTMLElement {
    return this._container;
  }

  get port() : SerialConn {
    return this._port;
  }

  public opened(is_open:boolean = true) {
    this.configure_connect(false);
    this.configure_connected(true);
    this._btn_open.textContent = 'Close';
  }

  private closed() {
    this.configure_connect(true);
    this.configure_connected(false);
    this._btn_open.textContent = 'Open';
  }

  private configure_connect(enable:boolean) {
    this._container.querySelectorAll('.sel-serial-conn').forEach(el => {
      (el as HTMLSelectElement).disabled = !enable;
    });
  }

  private configure_connected(enable:boolean) {
    this._container.querySelectorAll('.serial-signal-button').forEach(btn => {
      (btn as HTMLButtonElement).disabled = !enable;
    });
    (this._container.querySelector('.serial-input') as HTMLInputElement).disabled = !enable;
    (this._container.querySelector('.serial-send') as HTMLButtonElement).disabled = !enable;
    (this._container.querySelector('.serial-btn-signal') as HTMLButtonElement).disabled = !enable;
  }

  private error(message:string) {
    this._data.error(message);
  }

  private data(data:ParseData) {
    this._data.receive(data.data, data.size, data.raw);
  }

  private disconnect() {
    this._port.disconnect();
    this._parser.stop();

    this.configure_connect(false);
    this.configure_connected(false);
    this._btn_open.disabled = true;
    this._data.warning('Disconnected');
    
    this.emit('disconnect', undefined);
  }
};

interface SerialViewConsoleEvents {
  'open': undefined,
  'close': undefined,
  'release': undefined
};

export class SerialViewConsole extends EventEmitter<SerialViewConsoleEvents> {
  private _port:SerialConn;
  private _terminal:DataTerminal;

  constructor(port:SerialConn, container:HTMLElement) {
    super();

    this._port = port;
    this._terminal = new DataTerminal(container);
    this._port.on('data', data => this._terminal.write(data));
    this._port.on('open', () => this.emit('open', undefined));
    this._port.on('close', () => this.emit('close', undefined));
  }

  public get terminal()  {
    return this._terminal;
  }

  public get port() {
    return this._port;
  }
};

type SerialListEvents = {
  'connect': Array<SerialConn>,
  'disconnect': Array<SerialConn>,
  'get_ports': Array<SerialConn>
};

export class SerialList extends EventEmitter<SerialListEvents>{
  private _ports:Array<SerialConn>;
  private _id:number = 0;

  constructor() {
    super();
    this._ports = [];

    navigator.serial.onconnect = ev => {
      this._ports.push(new SerialConn(ev.target as SerialPort, ++this._id));
      this.emit('connect', this._ports);
    };

    navigator.serial.ondisconnect = ev => {
      const port = this._ports.find(p => p.port === ev.target);
      if (port) {
        port.emit('disconnect', undefined);
        this._ports = this._ports.filter(p => p.port !== ev.target)
      }
      this.emit('disconnect', this._ports);
    };

    this.get_ports();
  }

  public get ports() : Array<SerialConn> {
    return this._ports;
  }

  public port_by_id(id:number) : SerialConn | undefined {
    return this._ports.find(p => p.id == id);
  }

  public request() {
    navigator.serial.requestPort()
        .then(() => {
          this.get_ports();   
        })
        .catch(() => {});
  }

  private get_ports() {
    navigator.serial.getPorts()
    .then(ports => {
      this._ports = ports.reduce((acc, port) => {
        acc.push(new SerialConn(port, ++this._id));
        return acc;
      }, Array<SerialConn>());
      this.emit('get_ports', this._ports);
    })
    .catch(() => {});
  }
};

function update_ports(ports:Array<SerialConn>, select:HTMLSelectElement) : void {
  select.innerHTML = '';
  if (ports.length == 0) {
    select.appendChild(new Option('No ports', '0'));
    select.disabled = true;
    return;
  }
  select.disabled = false;
  ports.forEach(port =>
    select.appendChild(new Option(make_serial_name(port.port), port.id.toString())));
}

export function install_serial_events(list:SerialList, select:HTMLSelectElement) {
  list.on('connect', () => update_ports(list.ports, select));
  list.on('disconnect', () => update_ports(list.ports, select));
  list.on('get_ports', () => update_ports(list.ports, select));
}
