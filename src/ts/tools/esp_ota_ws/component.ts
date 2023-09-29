import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import {
  parse,
  ErrorDescription,
  type EspOTAWsResponse,
  type EspOTAWsStateResponse,
  type EspOTAWsActionResponse,
  type EspOTAWsErrorResponse,
  type EspOTAWsAbortResponse,
  AbortReason,
  start_packet,
  abort_packet,
  state_packet,
  Action,
  action_packet,
} from './packets';
import type DataDisplay from '../../web-components/data-display/data-display';
import { discover_file } from '../esptool/files';
import { type ESPFlashFile } from '../esptool/types';
import {
  time as time_format,
  miliseconds_to_duration,
} from '../../helper/time';
import { is_secure_connection } from '../../helper/protocol';
import type { InputWithUnit } from '../../web-components/input-with-unit';
import type { ProgressBar } from '../../web-components/progress-bar';

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

    #progress {
      flex-grow: 1;
      box-sizing: border-box;
      align-self: stretch;
      margin: 2px;
    }

    #connect {
      color: white;
      padding: 3px;
    }

    #connect {
      display: inline-block;
      min-width: 3ch;
      border-radius: 5px;
      text-align: center;
    }

    #connect legend {
      text-align: left;
    }

    #btn-connect[data-state="close"]::after {
      content: '▶';
    }

    #btn-connect[data-state="open"]::after {
      content: '✕';
    }

    #start-option-container {
      display: flex;
      flex-direction: column;
      width: max-content;
      background-color: #222;
      padding: 3px;
      border-radius: 3px;
      border: 1px solid;
      transform: translateX(-100px);
    }

    #start-option-header {
      font-size: large;
    }

    #update-timeout {
      width: 100%;
      box-sizing: border-box;
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
      <fieldset class=command-fs>
        <legend>Start</legend>
        <input id=file-upload type=file>
        <dropdown-menu id=start-options>
          <span slot=menu id=start-option-header>⚙</span>
          <div id=start-option-container>
            <input-with-unit id=update-timeout type=number unit=ms placeholder=Timeout title="Max wait between packages"></input-with-unit>
            <label><input type=checkbox id=reboot title"Reboot device after update" checked>Reboot</label>
            <label><input type=checkbox id=check-invalid title"Check last invalid version updated" checked>Check invalid</label>
            <label><input type=checkbox id=check-same title"Check last invalid version updated" checked>Check same</label>
          </div>
        </dropdown-menu>
        <button id=start-pkt>▶</button>
        <button id=abort-pkt title='Abort'>🛑</button>
      </fieldset>
      <button id=clear-display>&#x239A;</button>
      <fieldset class=command-fs>
        <legend>Action</legend>
        <button id=reboot-btn title="Reboot device">&#x23FC;</button>
        <button id=validate-btn title="Validate image" style=color:green>&#x2714;</button>
        <button id=invalidate-btn title="Invalidate image" style=color:red>&#x2718;</button>
      </fieldset>
    </div>
    <progress-bar id=progress>
      <div id=time-info></div>: [<div id=state-info>Not running</div>] <div id=progress-info></div>
    </progress-bar>
  </div>
  <display-data id=data></display-data>`;
  return template;
})();

interface EspOTAWsOptions {
  protocol?: string;
  address?: string;
  autoconnect?: boolean;
  timeout?: number;
  check_invalid?: boolean;
  check_same?: boolean;
  reboot?: boolean;
}

export class EspOTAWsComponent extends ComponentBase {
  private _ws?: WebSocket;

  private readonly _state: EspOTAWsOptions = {};

  private readonly _onopen: () => void;
  private readonly _onconnecting: () => void;
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

    const timeout_in = shadow.querySelector('#update-timeout') as InputWithUnit;

    const same_check = shadow.querySelector('#check-same') as HTMLInputElement;
    same_check.checked = this._state.check_same ?? true;

    const invalid_check = shadow.querySelector(
      '#check-invalid'
    ) as HTMLInputElement;
    invalid_check.checked = this._state.check_invalid ?? true;
    const reboot_check = shadow.querySelector('#reboot') as HTMLInputElement;
    reboot_check.checked = this._state.reboot ?? true;

    const abort_btn = shadow.querySelector('#abort-pkt') as HTMLButtonElement;

    // Action buttons
    const reboot_btn = shadow.querySelector('#reboot-btn') as HTMLButtonElement;
    const validate_btn = shadow.querySelector(
      '#validate-btn'
    ) as HTMLButtonElement;
    const invalidate_btn = shadow.querySelector(
      '#invalidate-btn'
    ) as HTMLButtonElement;

    this._onopen = () => {
      connect.dataset.state = 'open';
      connect.title = 'Close connection';
      protocol.disabled = true;
      address.disabled = true;

      start_btn.disabled = false;
      abort_btn.disabled = false;
      reboot_btn.disabled = false;
      validate_btn.disabled = false;
      invalidate_btn.disabled = false;
    };

    this._onconnecting = () => {
      connect.dataset.state = 'open';
      connect.title = 'Close connection';
      protocol.disabled = true;
      address.disabled = true;

      start_btn.disabled = true;
      abort_btn.disabled = true;
      reboot_btn.disabled = true;
      validate_btn.disabled = true;
      invalidate_btn.disabled = true;
    };

    this._onclose = () => {
      connect.dataset.state = 'close';
      connect.title = 'Open connection';
      protocol.disabled = false;
      address.disabled = false;

      start_btn.disabled = true;
      abort_btn.disabled = true;
      reboot_btn.disabled = true;
      validate_btn.disabled = true;
      invalidate_btn.disabled = true;
    };

    this._onclose();

    customElements
      .whenDefined('input-with-unit')
      .then(() => {
        timeout_in.value =
          this._state.timeout === undefined || this._state.timeout === 0
            ? ''
            : this._state.timeout.toString();

        start_btn.addEventListener('click', () => {
          if (this._upload_file === undefined) {
            this._display.warning('No file selected');
            return;
          }

          this._state.timeout =
            timeout_in.value === '' ? 0 : parseInt(timeout_in.value, 10);
          this._state.check_invalid = invalid_check.checked;
          this._state.check_same = same_check.checked;
          this._state.reboot = reboot_check.checked;
          this.save_state();

          this.send(
            start_packet({
              size: this._upload_file.file.size,
              timeout:
                timeout_in.value === '' ? 0 : parseInt(timeout_in.value, 10),
              check_invalid: invalid_check.checked,
              check_same: same_check.checked,
              reboot: reboot_check.checked,
            })
          );
        });
      })
      .finally(() => {});

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

    reboot_btn.addEventListener('click', () => {
      if (this._ws === undefined) return;
      this.send(action_packet(Action.RESET));
    });

    validate_btn.addEventListener('click', () => {
      if (this._ws === undefined) return;
      this.send(action_packet(Action.VALIDATE_IMAGE));
    });

    invalidate_btn.addEventListener('click', () => {
      if (this._ws === undefined) return;
      this.send(action_packet(Action.INVALIDATE_IMAGE));
    });

    // Info
    const progress = shadow.querySelector('#progress') as ProgressBar;
    const time_info = shadow.querySelector('#time-info') as HTMLElement;
    const state_info = shadow.querySelector('#state-info') as HTMLElement;
    const progress_info = shadow.querySelector('#progress-info') as HTMLElement;
    let time_token: ReturnType<typeof setInterval>;
    let start_time: number;

    this._update_info = (
      resp: EspOTAWsStateResponse | EspOTAWsAbortResponse
    ) => {
      const date = time_format();
      let state = 'Running';
      if ('reason' in resp) {
        clearInterval(time_token);
        state_info.textContent = 'Aborted';
        progress.bg_color = '#500';
        progress.bar_color = '#f00';
      } else if ('size_rcv' in resp) {
        // State
        progress.bg_color = '#999999';
        progress.bar_color = '#00CC00';
        if (resp.size_rcv >= (this._upload_file?.file.size as number)) {
          clearInterval(time_token);
          state = 'Finished';
        } else if (resp.size_rcv === 0) {
          clearInterval(time_token);
          start_time = Date.now();
          time_token = setInterval(() => {
            if (this._ws === undefined) clearInterval(time_token);
            time_info.textContent = miliseconds_to_duration(
              Date.now() - start_time
            );
          }, 10);
        }

        state_info.textContent = state;

        const name = this._upload_file?.name ?? '';
        const total_size = this._upload_file?.file.size ?? 0;
        const percent =
          total_size === 0 ? 0 : 100 * (resp.size_rcv / total_size);
        progress_info.textContent = ` ${name} ${resp.size_rcv} / ${
          total_size ?? '-'
        } (${percent.toFixed(1)} %)`;
        progress.value = percent;
        progress.title = `${date}: ${progress.text}`;

        if (resp.size_request > 0 && this._upload_file !== undefined) {
          const data = state_packet(
            this._upload_file,
            resp.size_rcv,
            resp.size_request
          );
          this.send_binary(data, resp.size_rcv, resp.size_request);
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
      this._ws = new WebSocket(`${protocol}://${addr}`);
      this._ws.binaryType = 'arraybuffer';

      this._onconnecting();

      customElements
        .whenDefined('display-data')
        .then(() => {
          this._display.command(`Connecting ${protocol}://${addr}...`);
        })
        .finally(() => {});

      this._ws.onopen = () => {
        this.on_open(protocol, addr);
      };
      this._ws.onmessage = ev => {
        this.on_message(ev);
      };
      this._ws.onclose = ev => {
        this.on_close(addr, ev);
      };
      this._ws.onerror = ev => {
        this._display.error(`ERROR! Socket error`);
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
      } [${offset} / ${this._upload_file?.file.size ?? '-'}]`,
      data.byteLength,
      data
    );
  }

  private on_open(protocol: string, addr: string): void {
    this._state.protocol = protocol;
    this._state.address = addr;
    this.save_state();

    this._onopen();

    this._display.command(`Socket ${protocol}://${addr} opened`);
  }

  private on_message(ev: MessageEvent): void {
    try {
      const d: EspOTAWsResponse = parse(new Uint8Array(ev.data));
      if ('action' in d) {
        this.action_response(d);
        return;
      }
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
  }

  private on_close(addr: string, ev: CloseEvent): void {
    this._onclose();
    this._ws = undefined;
    this._display.command(`Socket ${addr} closed [${ev.code}]`);
  }

  private response_error(d: EspOTAWsErrorResponse): void {
    this._display.error(
      `ERROR: ${ErrorDescription[d.error] ?? 'Unrecognized'} [${
        d.error as number
      }]`
    );
  }

  private abort_response(d: EspOTAWsAbortResponse): void {
    this._display.error(
      `ABORTED: ${AbortReason[d.reason] ?? 'Unrecognized'} [${
        d.reason as number
      }]`
    );
  }

  private action_response(d: EspOTAWsActionResponse): void {
    this._display.command(
      `ACTION: ${Action[d.action] ?? 'Unrecognized'} [${d.action as number}] [${
        d.error
      }]`
    );
  }

  private save_state(): void {
    window.console_app.set_tool_state('esp_ota_ws', this._state, true);
  }
}
