import EventEmitter from '../../libs/event_emitter';
import type DataDisplay from '../../web-components/data-display/data-display';
import { ParseUntilTimeout, type ParseData } from '../../libs/stream_parser';
import { DataTerminal } from '../../libs/terminal';
import { esp32_signal_reset } from './functions';
import type { SerialConn } from './serial';
import type { BinaryInputSelect } from '../../web-components/binary-input/text-select-binary';

const serialBaudrate: number[] = [
  9600, 19200, 38400, 57600, 115200, 230400, 460800, 576000, 921600,
];
const serialDataBits = [7, 8];
const serialFlowControl = ['none', 'hardware'];
const serialParity = ['none', 'even', 'odd'];
const serialStopBits = [1, 2];

const serialDefaults = {
  baudRate: 115200,
  dataBits: 8,
  flowControl: 'none',
  parity: 'none',
  stopBits: 1,
};

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <div>
      <div>
        <input type=number min=0 class='sel-serial-conn serial-baudrate' list=serial-baudrate-list>
        <datalist id=serial-baudrate-list></datalist>
        <select class='sel-serial-conn serial-databits'></select>
        <select class='sel-serial-conn serial-flowcontrol'></select>
        <select class='sel-serial-conn serial-parity'></select>
        <select class='sel-serial-conn serial-stopbits'></select>
        <button class=serial-connect>Open</button>
        <button class=serial-data-clear>Clear</button>
        <button class='serial-console btn-not-pressed'>Console</button>
      </div>
      <div>
        <text-select-binary class=serial-input placeholder=Data selected=text></text-select-binary>
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

  function make_select(
    mclass: string,
    values: string[] | number[],
    mdefault: any
  ): void {
    const el = template.content.querySelector(mclass);
    values.forEach(v =>
      el?.appendChild(new Option(`${v}`, `${v}`, v === mdefault))
    );
  }

  const list = template.content.querySelector('#serial-baudrate-list');
  (
    template.content.querySelector('.serial-baudrate') as HTMLInputElement
  ).value = `${serialDefaults.baudRate}`;
  serialBaudrate.forEach(bd => {
    list?.appendChild(new Option(`${bd}`));
  });

  make_select('.serial-databits', serialDataBits, serialDefaults.dataBits);
  make_select(
    '.serial-flowcontrol',
    serialFlowControl,
    serialDefaults.flowControl
  );
  make_select('.serial-parity', serialParity, serialDefaults.parity);
  make_select('.serial-stopbits', serialStopBits, serialDefaults.stopBits);

  return template;
})();

interface SerialViewEvents {
  console: boolean;
  close_console: undefined;
  disconnect: undefined;
}

export class SerialView extends EventEmitter<SerialViewEvents> {
  private readonly _port: SerialConn;
  private readonly _container: HTMLElement;
  private readonly _btn_open: HTMLButtonElement;
  private readonly _data: DataDisplay;
  private readonly _out_data: BinaryInputSelect;
  private readonly _parser: ParseUntilTimeout;

  constructor(port: SerialConn) {
    super();

    this._port = port;

    this._container = document.createElement('div');
    this._container.classList.add('golden-content');
    this._container.appendChild(template.content.cloneNode(true));

    this._btn_open = this._container.querySelector(
      '.serial-connect'
    ) as HTMLButtonElement;
    this._data = this._container.querySelector('.data') as DataDisplay;
    this._out_data = this._container.querySelector(
      '.serial-input'
    ) as BinaryInputSelect;

    this._parser = new ParseUntilTimeout(100);

    this._port.on('open', () => {
      this.opened();
      this._parser.start();
    });
    this._port.on('close', () => {
      this.closed();
      this._parser.stop();
    });
    this._port.on('error', error => {
      this.error(error);
    });
    this._port.on('data', data => {
      this._parser.process(data);
    });
    this._port.on('disconnect', () => {
      this.disconnect();
    });

    this._parser.on('data', d => {
      this.data(d);
    });

    this.closed();

    this._btn_open.onclick = async () => {
      try {
        if (this._port.state === 'close') {
          await this._port.open({
            baudRate: +(
              this._container.querySelector(
                '.serial-baudrate'
              ) as HTMLSelectElement
            ).value,
            dataBits: +(
              this._container.querySelector(
                '.serial-databits'
              ) as HTMLSelectElement
            ).value,
            flowControl: (
              this._container.querySelector(
                '.serial-flowcontrol'
              ) as HTMLSelectElement
            ).value as FlowControlType,
            parity: (
              this._container.querySelector(
                '.serial-parity'
              ) as HTMLSelectElement
            ).value as ParityType,
            stopBits: +(
              this._container.querySelector(
                '.serial-stopbits'
              ) as HTMLSelectElement
            ).value,
          });
        } else if (this._port.state === 'open') {
          await this._port.close();
        }
      } catch (e) {
        if (e instanceof Error) this._data.error(`${e.message}`);
        this.disconnect();
      }
    };

    // Read signal
    (
      this._container.querySelector('.serial-btn-signal') as HTMLButtonElement
    ).onclick = async () => {
      function set_signal(
        s: SerialInputSignals,
        mclass: string,
        property: keyof SerialInputSignals,
        container: HTMLElement
      ): void {
        if (s[property])
          container.querySelector(mclass)?.classList.add('signal-set');
        else container.querySelector(mclass)?.classList.remove('signal-set');
      }
      const s = await this._port.port.getSignals();
      set_signal(s, '.serial-CTS', 'clearToSend', this._container);
      set_signal(s, '.serial-DCD', 'dataCarrierDetect', this._container);
      set_signal(s, '.serial-DSR', 'dataSetReady', this._container);
      set_signal(s, '.serial-RI', 'ringIndicator', this._container);
    };

    // Send data
    (
      this._container.querySelector('.serial-send') as HTMLButtonElement
    ).onclick = async () => {
      const data = this._out_data.data;
      if (data.length > 0) {
        await this._port.write(this._out_data.data);
        this._data.send_binary(data);
      }
    };

    // Clear data
    (
      this._container.querySelector('.serial-data-clear') as HTMLButtonElement
    ).onclick = () => {
      this._data.clear();
    };

    // Reset ESP32 device
    (
      this._container.querySelector('.serial-signal-reset') as HTMLButtonElement
    ).onclick = async () => {
      await esp32_signal_reset(this._port);
    };

    // Open/Close serial console
    const btn_console = this._container.querySelector(
      '.serial-console'
    ) as HTMLButtonElement;
    (
      this._container.querySelector('.serial-console') as HTMLButtonElement
    ).onclick = ev => {
      if (btn_console.classList.contains('btn-pressed')) {
        this.emit('console', false);
      } else {
        btn_console.classList.remove('btn-not-pressed');
        btn_console.classList.add('btn-pressed');
        this.emit('console', true);
      }
    };

    this.on('close_console', () => {
      btn_console.classList.add('btn-not-pressed');
      btn_console.classList.remove('btn-pressed');
    });
  }

  get container(): HTMLElement {
    return this._container;
  }

  get port(): SerialConn {
    return this._port;
  }

  public opened(is_open: boolean = true): void {
    this.configure_connect(false);
    this.configure_connected(true);
    this._btn_open.textContent = 'Close';
  }

  private closed(): void {
    this.configure_connect(true);
    this.configure_connected(false);
    this._btn_open.textContent = 'Open';
  }

  private configure_connect(enable: boolean): void {
    this._container.querySelectorAll('.sel-serial-conn').forEach(el => {
      (el as HTMLSelectElement).disabled = !enable;
    });
  }

  private configure_connected(enable: boolean): void {
    this._container.querySelectorAll('.serial-signal-button').forEach(btn => {
      (btn as HTMLButtonElement).disabled = !enable;
    });
    (
      this._container.querySelector('.serial-input') as HTMLInputElement
    ).disabled = !enable;
    (
      this._container.querySelector('.serial-send') as HTMLButtonElement
    ).disabled = !enable;
    (
      this._container.querySelector('.serial-btn-signal') as HTMLButtonElement
    ).disabled = !enable;
  }

  private error(message: string): void {
    this._data.error(message);
  }

  private data(data: ParseData): void {
    this._data.receive(data.data, data.size, data.raw);
  }

  private disconnect(): void {
    this._port.disconnect();
    this._parser.stop();

    this.configure_connect(false);
    this.configure_connected(false);
    this._btn_open.disabled = true;
    this._data.warning('Disconnected');

    this.emit('disconnect', undefined);
  }
}

interface SerialViewConsoleEvents {
  open: undefined;
  close: undefined;
  release: undefined;
}

export class SerialViewConsole extends EventEmitter<SerialViewConsoleEvents> {
  private readonly _port: SerialConn;
  private readonly _terminal: DataTerminal;

  constructor(port: SerialConn, container: HTMLElement) {
    super();

    this._port = port;
    this._terminal = new DataTerminal(container);
    this._port.on('data', data => {
      this._terminal.write(data);
    });
    this._port.on('open', () => {
      this.emit('open', undefined);
    });
    this._port.on('close', () => {
      this.emit('close', undefined);
    });
  }

  public get terminal(): DataTerminal {
    return this._terminal;
  }

  public get port(): SerialConn {
    return this._port;
  }
}
