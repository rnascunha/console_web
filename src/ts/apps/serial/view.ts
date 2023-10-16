import EventEmitter from '../../libs/event_emitter';
import type DataDisplay from '../../web-components/data-display/data-display';
import { ParseUntilTimeout, type ParseData } from '../../libs/stream_parser';
import { hard_reset as esp32_reset } from '../../libs/esptool.ts/loader/reset';
import type { SerialConn } from '../../libs/serial/serial';
import type { Encoding } from '../../libs/binary-dump';
import type { BinaryInputSelect } from '../../web-components/binary-input/text-select-binary';
import {
  serialDefaults,
  serialBaudrate,
  serialDataBits,
  serialFlowControl,
  serialParity,
  serialStopBits,
} from '../../libs/serial/constants';
import html from './template.html';

export interface SerialState {
  open: SerialOptions;
  input: {
    data: number[];
    encode: Encoding;
  };
}

export const serial_state_default: SerialState = {
  open: serialDefaults,
  input: {
    data: [],
    encode: 'text',
  },
};

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = html;

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
  state: SerialState;
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

  // Open serial fields
  private readonly _el_baudrate: HTMLInputElement;
  private readonly _el_databits: HTMLSelectElement;
  private readonly _el_flowcontrol: HTMLSelectElement;
  private readonly _el_parity: HTMLSelectElement;
  private readonly _el_stopbits: HTMLSelectElement;

  constructor(port: SerialConn, state?: SerialState) {
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

    this._el_baudrate = this._container.querySelector(
      '.serial-baudrate'
    ) as HTMLInputElement;
    this._el_databits = this._container.querySelector(
      '.serial-databits'
    ) as HTMLSelectElement;
    this._el_flowcontrol = this._container.querySelector(
      '.serial-flowcontrol'
    ) as HTMLSelectElement;
    this._el_parity = this._container.querySelector(
      '.serial-parity'
    ) as HTMLSelectElement;
    this._el_stopbits = this._container.querySelector(
      '.serial-stopbits'
    ) as HTMLSelectElement;

    if (state !== undefined) this.set_state(state);

    this._port.on('open', () => {
      this._port
        .read()
        .catch(e => {
          this.error(e.message);
        })
        .finally(() => {});
      this.opened();
      this._parser.start();
      this.emit('state', this.state());
    });
    this._port.on('close', () => {
      this.closed();
      this._parser.stop();
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
          await this._port.open(this.open_parameters());
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
    ).onclick = () => {
      this.send().finally(() => {});
    };
    this._out_data.onkeyup = ev => {
      if (ev.key === 'Enter') this.send().finally(() => {});
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
      await esp32_reset(this._port);
    };

    // Open/Close serial console
    const btn_console = this._container.querySelector(
      '.serial-console'
    ) as HTMLButtonElement;
    (
      this._container.querySelector('.serial-console') as HTMLButtonElement
    ).onclick = () => {
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
    if (enable) this._out_data.removeAttribute('disabled');
    else this._out_data.setAttribute('disabled', '');
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

  private async send(): Promise<void> {
    const data = this._out_data.data;
    if (data.length > 0) {
      await this._port.write(data);
      this._data.send(data);
      this.emit('state', this.state());
    }
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

  private open_parameters(): SerialOptions {
    return {
      baudRate: +this._el_baudrate.value,
      dataBits: +this._el_databits.value,
      flowControl: this._el_flowcontrol.value as FlowControlType,
      parity: this._el_parity.value as ParityType,
      stopBits: +this._el_stopbits.value,
    };
  }

  private state(): SerialState {
    return {
      open: this.open_parameters(),
      input: {
        data: Array.from(this._out_data.data),
        encode: this._out_data.encode,
      },
    };
  }

  private set_state(state: SerialState): void {
    this._el_baudrate.value = state.open.baudRate.toString();
    this._el_databits.value = state.open.dataBits?.toString() as string;
    this._el_flowcontrol.value = state.open.flowControl as FlowControlType;
    this._el_parity.value = state.open.parity as ParityType;
    this._el_stopbits.value = state.open.stopBits?.toString() as string;

    /**
     * TODO: fix this.
     */
    customElements
      .whenDefined('text-select-binary')
      .then(() => {
        this._out_data.encode = state.input.encode;
        this._out_data.data = Uint8Array.from(state.input.data);
      })
      .finally(() => {});
  }
}
