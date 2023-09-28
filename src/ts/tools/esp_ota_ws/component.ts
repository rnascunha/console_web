import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import {
  parse,
  // packets,
  // Command,
  ErrorDescription,
  type EspOTAWsResponse,
  type EspOTAWsStateResponse,
  type EspOTAWsErrorResponse,
  type EspOTAWsAbortResponse,
  AbortReason,
  start_packet,
  abort_packet,
  state_packet,
} from './packets';
import type DataDisplay from '../../web-components/data-display/data-display';
import { discover_file } from '../esptool/files';
import { type ESPFlashFile } from '../esptool/types';
import {
  time as time_format,
  miliseconds_to_duration,
} from '../../helper/time';
import { download } from '../../helper/download';
import { is_secure_connection } from '../../helper/protocol';

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
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
    }

    .command-fs {
      display: inline-block;
      color: white;
      border-radius: 5px;
      padding: 3px;
    }

    #open-freq-receive,
    #open-limit-receive,
    #config-k {
      width: 12ch;
    }

    #close-pkt {
      color: red;
    }

    label {
      color: white;
      user-select: none;
    }

    #info, #connect {
      color: white;
    }

    #connect {
      padding: 3px;
    }

    #info fieldset,
    #connect {
      display: inline-block;
      min-width: 3ch;
      border-radius: 5px;
      text-align: center;
    }

    #info fieldset legend,
    #connect legend {
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
    <fieldset id=connect>
      <legend>Connect</legend>
      <select id=protocol>
        ${is_secure_connection() ? '' : '<option value=ws>ws</option>'}
        <option value=wss>wss</option>
      </select>
      <input id=address placeholder="Device address" >
      <button id=btn-connect title=Connect></button>
      <label title='Auto-connect'><input id=autoconnect type=checkbox>&#8652;</label>
    </fieldset>
    <div id=packets>
      <button id=clear-display>&#x239A;</button>
      <fieldset class=command-fs>
        <legend>Start</legend>
        <input id=file-upload type=file>
        <button id=start-pkt>▶</button>
      </fieldset>
      <button id=abort-pkt title='Abort'>🛑</button>
    </div>
    <div id=info>
      <fieldset>
        <legend>State</legend>
        <div id=state-info>-</div>
      </fieldset>
      <fieldset>
        <legend>Upload Size</legend>
        <div id=upload-size-info>-</div>
      </fieldset>
      <fieldset>
        <legend>Time</legend>
        <div id=time-info>-</div>
      </fieldset>
    </div>
    <button id=save-data>Save</button>
  </div>
  <display-data id=data></display-data>`;
  return template;
})();

interface EspOTAWsOptions {
  protocol?: string;
  address?: string;
  autoconnect?: boolean;
}

interface EspOTAWsData {
  date: number;
  size: number;
  total: number;
}

export class EspOTAWsComponent extends ComponentBase {
  private _ws?: WebSocket;

  private readonly _data: EspOTAWsData[][] = [];
  private readonly _state: EspOTAWsOptions = {};

  private readonly _onopen: () => void;
  private readonly _onclose: () => void;
  private readonly _update_info: (
    data: EspOTAWsStateResponse | EspOTAWsAbortResponse
  ) => void;

  private _upload_file?: ESPFlashFile;

  private readonly _display: DataDisplay;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Esp OTA Ws';
    this._state = (state ?? {}) as EspOTAWsOptions;

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._display = shadow.querySelector('#data') as DataDisplay;
    shadow.querySelector('#clear-display')?.addEventListener('click', () => {
      this._display.clear();
      this._data.splice(0, this._data.length);
    });

    // Connect
    const protocol = shadow.querySelector('#protocol') as HTMLSelectElement;
    const connect = shadow.querySelector('#btn-connect') as HTMLButtonElement;
    const address = shadow.querySelector('#address') as HTMLInputElement;
    const autoconnect = shadow.querySelector(
      '#autoconnect'
    ) as HTMLInputElement;

    const opt = state as EspOTAWsOptions;
    if (opt.protocol !== undefined) protocol.value = opt.protocol;
    address.value = opt.address ?? '';
    if (opt.autoconnect === true) autoconnect.checked = true;

    autoconnect.addEventListener('change', ev => {
      this._state.autoconnect = autoconnect.checked;
      this.save_state();
    });

    // Commands
    const start_btn = shadow.querySelector('#start-pkt') as HTMLButtonElement;
    const file_picker = shadow.querySelector(
      '#file-upload'
    ) as HTMLInputElement;
    const abort_btn = shadow.querySelector('#abort-pkt') as HTMLButtonElement;

    this._onopen = () => {
      connect.dataset.state = 'open';
      connect.title = 'Close connection';
      protocol.disabled = true;
      address.disabled = true;

      start_btn.disabled = false;
      abort_btn.disabled = false;
    };

    this._onclose = () => {
      connect.dataset.state = 'close';
      connect.title = 'Open connection';
      protocol.disabled = false;
      address.disabled = false;

      start_btn.disabled = true;
      abort_btn.disabled = true;
    };

    this._onclose();

    start_btn.addEventListener('click', () => {
      if (this._upload_file === undefined) {
        this._display.warning('No file selected');
        return;
      }
      this.send(start_packet(this._upload_file.file.size));
    });

    abort_btn.addEventListener('click', () => {
      this.send(abort_packet());
    });

    file_picker.addEventListener('change', () => {
      const files = file_picker.files as FileList;
      if (files.length === 0) {
        this._display.warning('No file selected');
        this._upload_file = undefined;
        return;
      }

      discover_file(files[0])
        .then(esp_file => {
          if (esp_file.type !== 'app') {
            this._display.error(
              `File '${esp_file.name}' is not a valid ESP APP file`
            );
            return;
          }
          this._upload_file = esp_file;
          this._display.command(
            `File '${esp_file.name}' readed [${esp_file.file.size} bytes]`
          );
        })
        .finally(() => {});
    });

    // Info

    const state_info = shadow.querySelector('#state-info') as HTMLElement;
    const up_size_info = shadow.querySelector(
      '#upload-size-info'
    ) as HTMLElement;
    const time_info = shadow.querySelector('#time-info') as HTMLElement;
    let time_token: ReturnType<typeof setInterval>;
    let start_time: number;

    this._update_info = (
      resp: EspOTAWsStateResponse | EspOTAWsAbortResponse
    ) => {
      const date = time_format();
      let state = 'Running';
      if ('abort' in resp) {
        clearInterval(time_token);
        state = 'Aborted';
      } else if ('size_rcv' in resp) {
        // State
        if (resp.size_rcv >= (this._upload_file?.file.size as number)) {
          clearInterval(time_token);
          state = 'Finished';
        } else if (resp.size_rcv === 0) {
          clearInterval(time_token);
          start_time = Date.now();
          time_token = setInterval(() => {
            if (this._ws === undefined) clearInterval(time_token);
            time_info.innerHTML = miliseconds_to_duration(
              Date.now() - start_time
            );
          }, 10);
        }
        state_info.textContent = state;
        state_info.title = `${date}: ${state}`;

        const size = `${resp.size_rcv} / ${
          this._upload_file?.file.size ?? '-'
        }`;
        up_size_info.textContent = size;
        up_size_info.title = `${date}: ${size}`;

        if (resp.size_request > 0 && this._upload_file !== undefined) {
          const data = state_packet(
            this._upload_file,
            resp.size_rcv,
            resp.size_request
          );
          this.send_binary(data, resp.size_rcv, data.byteLength);
        }
      }
    };

    connect.addEventListener('click', () => {
      if (this._ws === undefined) {
        this.connect(protocol.value, address.value);
        return;
      }

      this._ws.close();
    });

    shadow.querySelector('#save-data')?.addEventListener('click', () => {
      download(
        'esp-ota-ws-data.json',
        JSON.stringify(this._data, undefined, 0)
      );
    });

    this.container.on('beforeComponentRelease', () => {
      if (this._ws !== undefined) this._ws.close();
    });

    this.container.on('open', () => {
      if (address.value.length > 0 && opt.autoconnect === true)
        this.connect(protocol.value, address.value);
    });
  }

  private connect(protocol: string, addr: string): boolean {
    if (
      this._ws !== undefined &&
      this._ws.readyState === WebSocket.CONNECTING
    ) {
      this._display.warning(`Already trying to connect to [${this._ws.url}]`);
      return false;
    }

    try {
      this._ws = new WebSocket(`${protocol}://${addr}/ota`);
      this._ws.binaryType = 'arraybuffer';

      customElements
        .whenDefined('display-data')
        .then(() => {
          this._display.command(`Connecting ${protocol}://${addr}...`);
        })
        .finally(() => {});

      this._onopen();

      this._ws.onopen = ev => {
        this._state.protocol = protocol;
        this._state.address = addr;
        this.save_state();

        this._display.command(`Socket ${protocol}://${addr} opened`);
      };
      this._ws.onmessage = ev => {
        try {
          const d: EspOTAWsResponse = parse(new Uint8Array(ev.data));
          if ('error' in d) {
            this.response_error(d);
            return;
          }
          this._update_info(d);
          if ('reason' in d) {
            this.abort_response(d);
            return;
          }
          this._display.receive(JSON.stringify(d), ev.data.byteLength, ev.data);
        } catch (e) {
          this._display.error((e as Error).message);
        }
      };
      this._ws.onclose = ev => {
        console.log('close', ev);
        this._onclose();
        this._ws = undefined;
        this._display.command(`Socket ${addr} closed [${ev.code}]`);
      };
      this._ws.onerror = ev => {
        this._display.error(`ERROR! Socket error`);
        console.error('error', ev);
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
    this._ws.send(data);
    this._display.send(data);
  }

  private send_binary(data: Uint8Array, offset: number, size: number): void {
    if (this._ws === undefined) {
      this._display.error('Error sending... Not connected');
      return;
    }
    this._ws.send(data);
    this._display.send(
      `Sending '${this._upload_file?.name ?? '-'}' from ${offset} to ${
        offset + size
      } [${size} / ${this._upload_file?.file.size ?? '-'}]`,
      data.byteLength,
      data
    );
  }

  private response_error(d: EspOTAWsErrorResponse): void {
    this._display.error(`ERROR: ${error_name(d.error)} [${d.error as number}]`);
  }

  private abort_response(d: EspOTAWsAbortResponse): void {
    this._display.error(
      `ABORTED: ${abort_reason_name(d.reason)} [${d.reason as number}]`
    );
  }

  private save_state(): void {
    window.console_app.set_tool_state('esp_ota_ws', this._state, true);
  }
}

function error_name(error: ErrorDescription): string {
  if (error in ErrorDescription) {
    return ErrorDescription[error];
  }
  return 'Unrecognized';
}

function abort_reason_name(reason: AbortReason): string {
  if (reason in AbortReason) {
    return AbortReason[reason];
  }
  return 'Unrecognized';
}
