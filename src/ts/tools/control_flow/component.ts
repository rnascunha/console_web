import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import {
  parse,
  packets,
  Command,
  ControlFlowResponse,
  State,
  ErrorDescription,
  type ControlFlowResponseError,
} from './packets';
import type DataDisplay from '../../web-components/data-display/data-display';
import { time as time_format } from '../../helper/time';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      overflow: hidden;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    #header {
      margin-bottom: 3px;
    }

    label {
      color: white;
      user-select: none;
    }

    #info {
      color: white;
    }

    #info fieldset {
      display: inline-block;
      min-width: 3ch;
      border-radius: 5px;
      text-align: center;
    }

    #info fieldset legend {
      text-align: left;
    }

    #btn-connect[data-state="close"]::after {
      content: '▶';
    }

    #btn-connect[data-state="open"]::after {
      content: '✕';
    }
  </style>
  <div id=header>
    <div id=connect>
      <input id=address placeholder="Device address" >
      <button id=btn-connect title=Connect></button>
      <label><input id=autoconnect type=checkbox >Autoconnect</label>
    </div>
    <div id=packets>
      <button id=config-pkt>Config</button>
      <button id=state-pkt>State</button>
      <button id=open-pkt>Open</button>
      <button id=close-pkt>Close</button>
    </div>
    <div id=info>
      <fieldset>
        <legend>Version</legend>
        <div id=version-info>-</div>
      </fieldset>
      <fieldset>
        <legend>State</legend>
        <div id=state-info>-</div>
      </fieldset>
      <fieldset>
        <legend>Pulses</legend>
        <div id=pulse-info>-</div>
      </fieldset>
      <fieldset>
        <legend>Volume</legend>
        <div id=volume-info>-</div>
      </fieldset>
      <fieldset>
        <legend>K</legend>
        <div id=k-info>-</div>
      </fieldset>
    </div>
  </div>
  <display-data id=data></display-data>`;
  return template;
})();

interface ControlFlowOptions {
  address?: string;
  autoconnect?: boolean;
}

export class ControlFlowComponent extends ComponentBase {
  private _ws?: WebSocket;

  private readonly _onopen: () => void;
  private readonly _onclose: () => void;
  private readonly _update_info: (data: ControlFlowResponse) => void;
  private readonly _save_state: (address: string) => void;

  private readonly _display: DataDisplay;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Control Flow';

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._display = shadow.querySelector('#data') as DataDisplay;

    // Connect
    const connect = shadow.querySelector('#btn-connect') as HTMLButtonElement;
    const address = shadow.querySelector('#address') as HTMLInputElement;
    const autoconnect = shadow.querySelector(
      '#autoconnect'
    ) as HTMLInputElement;

    this._save_state = (address: string) => {
      window.console_app.set_tool_state(
        'control_flow',
        { address, autoconnect: autoconnect.checked },
        true
      );
    };

    const opt = state as ControlFlowOptions;
    address.value = opt.address ?? '';
    if (opt.autoconnect === true) autoconnect.checked = true;

    autoconnect.addEventListener('change', ev => {
      this._save_state(address.value);
    });

    // Commands
    const config = shadow.querySelector('#config-pkt') as HTMLButtonElement;
    const state_dev = shadow.querySelector('#state-pkt') as HTMLButtonElement;
    const open_valve = shadow.querySelector('#open-pkt') as HTMLButtonElement;
    const close_valve = shadow.querySelector('#close-pkt') as HTMLButtonElement;

    this._onopen = () => {
      connect.dataset.state = 'open';
      connect.title = 'Close connection';
      address.disabled = true;

      config.disabled = false;
      state_dev.disabled = false;
      open_valve.disabled = false;
      close_valve.disabled = false;
    };

    this._onclose = () => {
      connect.dataset.state = 'close';
      connect.title = 'Open connection';
      address.disabled = false;

      config.disabled = true;
      state_dev.disabled = true;
      open_valve.disabled = true;
      close_valve.disabled = true;
    };

    this._onclose();

    const state_info = shadow.querySelector('#state-info') as HTMLElement;
    const pulse_info = shadow.querySelector('#pulse-info') as HTMLElement;
    const volume_info = shadow.querySelector('#volume-info') as HTMLElement;
    const k_info = shadow.querySelector('#k-info') as HTMLElement;
    const version_info = shadow.querySelector('#version-info') as HTMLElement;

    this._update_info = (resp: ControlFlowResponse) => {
      const date = time_format();
      if (resp.state !== undefined) {
        const val = state_name(resp.state);
        state_info.textContent = val;
        state_info.title = `${date}: ${val} [${resp.state as number}]`;
      }

      if (resp.volume !== undefined) {
        const val = `${resp.volume} ml`;
        volume_info.textContent = val;
        volume_info.title = `${date}: ${val}`;
      }

      [
        [pulse_info, 'pulses'],
        [k_info, 'k'],
        [version_info, 'version'],
      ].forEach(([el, info]) => {
        const k = info as string;
        if (k in resp) {
          const val = `${resp[k as keyof ControlFlowResponse] as number}`;
          (el as HTMLElement).textContent = val;
          (el as HTMLElement).title = `${date}: ${val}`;
        }
      });
    };

    connect.addEventListener('click', () => {
      if (this._ws === undefined) {
        this.connect(address.value);
        return;
      }

      this._ws.close();
    });

    [
      [config, Command.CONFIG],
      [state_dev, Command.STATE],
      [open_valve, Command.OPEN_VALVE],
      [close_valve, Command.CLOSE_VALVE],
    ].forEach(([el, cmd]) => {
      (el as HTMLElement).addEventListener('click', () => {
        this.send(packets[cmd as Command]());
      });
    });

    this.container.on('beforeComponentRelease', () => {
      if (this._ws !== undefined) this._ws.close();
    });

    this.container.on('open', () => {
      if (address.value.length > 0 && opt.autoconnect === true)
        this.connect(address.value);
    });
  }

  private connect(addr: string): boolean {
    if (
      this._ws !== undefined &&
      this._ws.readyState === WebSocket.CONNECTING
    ) {
      this._display.warning(`Already trying to connect to [${this._ws.url}]`);
      return false;
    }

    try {
      this._ws = new WebSocket(`ws://${addr}/ws`);
      this._ws.binaryType = 'arraybuffer';
      this._save_state(addr);

      this._ws.onopen = ev => {
        this._onopen();
        this._display.command(`Socket ${addr} opened`);
      };
      this._ws.onmessage = ev => {
        try {
          const d: ControlFlowResponse | ControlFlowResponseError = parse(
            new Uint8Array(ev.data)
          );
          if (!('error' in d)) {
            this._update_info(d);
            this._display.receive(
              JSON.stringify(d),
              ev.data.byteLength,
              ev.data
            );
          } else {
            this._display.error(
              `ERROR: ${error_name(d.error)} [${d.response as number}]`
            );
          }
        } catch (e) {
          this._display.error((e as Error).message);
        }
      };
      this._ws.onclose = ev => {
        this._onclose();
        this._ws = undefined;
        this._display.command(`Socket ${addr} closed`);
      };
      this._ws.onerror = ev => {
        console.error('ws error', ev);
      };
    } catch (e) {
      console.error('error connecting', e);
      return false;
    }
    return true;
  }

  private send(data: Uint8Array): void {
    if (this._ws === undefined) {
      this._display.error('Error sending... Not connected');
      return;
    }
    this._ws?.send(data);
    this._display.send(data, undefined);
  }
}

function state_name(state: State): string {
  return Object.values(State)[state as number] as string;
}

function error_name(error: ErrorDescription): string {
  const val = Object.values(ErrorDescription)[error as number];
  return val !== undefined ? (val as string) : 'Urecognized';
}
