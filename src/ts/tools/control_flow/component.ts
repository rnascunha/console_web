import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import {
  parse,
  packets,
  Command,
  State,
  ErrorDescription,
  type ControlFlowResponse,
  type ControlFlowStateResponse,
  type ControlFlowConfigResponse,
  type ControlFlowErrorResponse,
} from './packets';
import type DataDisplay from '../../web-components/data-display/data-display';
import type { InputWithUnit } from '../../web-components/input-with-unit';
import {
  time as time_format,
  miliseconds_to_duration,
} from '../../helper/time';
import { download } from '../../helper/download';
import { is_secure_connection } from '../../helper/protocol';
import type { RLTimeLineGraphComponent } from '../../golden-components/time_line_graph';
import type { DateLineData } from '../../libs/d3-graph/time_lines';
import { pack32 } from '../../helper/pack';
import { Tooltip } from '../../libs/d3-graph/tooltip';

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
        <legend>Config</legend>
        <input-with-unit type=number min=0 id=config-k placeholder='Pulses/L' title='K (Pulses / L)' unit=p/L></input-with-unit>
        <button id=config-pkt>▶</button>
      </fieldset>
      <button id=state-pkt>State</button>
      <fieldset class=command-fs>
        <legend>Open</legend>
        <label title='Zero volume before opening'><input id=open-clear-before type=checkbox checked>Clear</label>
        <input-with-unit type=number min=0 id=open-freq-receive placeholder='Interval' title='Interval (ms)' unit=ms></input-with-unit>
        <input-with-unit type=number min=0 id=open-limit-receive placeholder='Limit' title='Limit (ml)' unit=ml></input-with-unit>
        <button id=open-pkt>▶</button>
      </fieldset>
      <button id=close-pkt title='Close valve'>🛑</button>
    </div>
    <div id=info>
      <fieldset>
        <legend>Version / K</legend>
        <div id=version-info>-</div>
      </fieldset>
      <fieldset>
        <legend>Freq / Limit</legend>
        <div id=freq-limit-info>- / -</div>
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
        <legend>Time</legend>
        <div id=time-info>-</div>
      </fieldset>
      <fieldset>
        <legend>Flow rate</legend>
        <div id=flow-rate-info>-</div>
      </fieldset>
    </div>
    <button id=save-data>Save</button>
    <button id=time-line-graph>Graph</button>
  </div>
  <display-data id=data></display-data>`;
  return template;
})();

interface ControlFlowOptions {
  protocol?: string;
  address?: string;
  autoconnect?: boolean;
  clear?: boolean;
  frequency?: number;
  limit?: number;
}

interface ControlFlowData {
  date: Date;
  volume: number;
  flow_instant: number;
  flow_mean: number;
  pulses: number;
  state: number;
}

export class ControlFlowComponent extends ComponentBase {
  private _ws?: WebSocket;

  private _k_ratio: number = 0;

  private _valve_state: State = State.CLOSE;
  private _valve_open_time: number = 0;

  private readonly _data: ControlFlowData[][] = [];
  private _graph_component?: RLTimeLineGraphComponent;

  private readonly _state: ControlFlowOptions = {};

  private readonly _onopen: () => void;
  private readonly _onclose: () => void;
  private readonly _update_info: (
    data: ControlFlowStateResponse | ControlFlowConfigResponse
  ) => void;

  private readonly _display: DataDisplay;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Control Flow';
    this._state = (state ?? {}) as ControlFlowOptions;

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

    const opt = state as ControlFlowOptions;
    if (opt.protocol !== undefined) protocol.value = opt.protocol;
    address.value = opt.address ?? '';
    if (opt.autoconnect === true) autoconnect.checked = true;

    autoconnect.addEventListener('change', ev => {
      this._state.autoconnect = autoconnect.checked;
      this.save_state();
    });

    // Commands
    const config = shadow.querySelector('#config-pkt') as HTMLButtonElement;
    const state_dev = shadow.querySelector('#state-pkt') as HTMLButtonElement;
    const open_valve = shadow.querySelector('#open-pkt') as HTMLButtonElement;
    const close_valve = shadow.querySelector('#close-pkt') as HTMLButtonElement;

    this._onopen = () => {
      connect.dataset.state = 'open';
      connect.title = 'Close connection';
      protocol.disabled = true;
      address.disabled = true;

      config.disabled = false;
      state_dev.disabled = false;
      open_valve.disabled = false;
      close_valve.disabled = false;
    };

    this._onclose = () => {
      connect.dataset.state = 'close';
      connect.title = 'Open connection';
      protocol.disabled = false;
      address.disabled = false;

      config.disabled = true;
      state_dev.disabled = true;
      open_valve.disabled = true;
      close_valve.disabled = true;
    };

    this._onclose();

    const freq_limit_info = shadow.querySelector(
      '#freq-limit-info'
    ) as HTMLElement;
    const state_info = shadow.querySelector('#state-info') as HTMLElement;
    const pulse_info = shadow.querySelector('#pulse-info') as HTMLElement;
    const volume_info = shadow.querySelector('#volume-info') as HTMLElement;
    const version_info = shadow.querySelector('#version-info') as HTMLElement;
    const time_info = shadow.querySelector('#time-info') as HTMLElement;
    const flow_rate_info = shadow.querySelector(
      '#flow-rate-info'
    ) as HTMLElement;

    let time_token: ReturnType<typeof setInterval>;
    this._update_info = (
      resp: ControlFlowStateResponse | ControlFlowConfigResponse
    ) => {
      const date = time_format();
      if ('k' in resp) {
        this._k_ratio = resp.k;

        version_info.textContent = `${resp.version} / ${resp.k}`;
        version_info.title = `${date}: Version=${resp.version} / K=${resp.k}`;
      } else {
        const fl = `${resp.freq} ms / ${
          resp.limit <= 0 ? '-' : resp.limit.toString() + ' p'
        }`;
        freq_limit_info.textContent = fl;
        freq_limit_info.title = `${date}: ${fl}`;

        // State
        const st = state_name(resp.state);
        state_info.textContent = st;
        state_info.title = `${date}: ${st} [${resp.state as number}]`;

        // Volume
        const volume = (1000 * resp.pulses) / this._k_ratio;
        const volume_out = `${((1000 * resp.pulses) / this._k_ratio).toFixed(
          2
        )} ml`;
        volume_info.textContent = volume_out;
        volume_info.title = `${date}: ${volume_out} [1000 * ${resp.pulses} / ${this._k_ratio}]`;

        // Pulse
        pulse_info.textContent = resp.pulses.toString();
        pulse_info.title = `${date}: ${resp.pulses}`;

        // Flow rate
        flow_rate_info.textContent = `${flow_rate_to_liters_per_minute(
          volume,
          this._valve_open_time,
          Date.now()
        ).toFixed(2)} L/min`;

        // Data
        this.compute_data(resp);
        this.update_graph();

        // Time
        if (this._valve_state === State.CLOSE && resp.state === State.OPEN) {
          time_info.innerHTML = miliseconds_to_duration(0);
          this._valve_open_time = Date.now();
          time_token = setInterval(() => {
            if (this._ws === undefined) clearInterval(time_token);
            time_info.innerHTML = miliseconds_to_duration(
              Date.now() - this._valve_open_time
            );
          }, 10);
        } else if (resp.state === State.CLOSE) clearInterval(time_token);
        this._valve_state = resp.state;
      }
    };

    connect.addEventListener('click', () => {
      if (this._ws === undefined) {
        this.connect(protocol.value, address.value);
        return;
      }

      this._ws.close();
    });

    [
      [state_dev, Command.STATE],
      [close_valve, Command.CLOSE_VALVE],
    ].forEach(([el, cmd]) => {
      (el as HTMLElement).addEventListener('click', () => {
        this.send(packets[cmd as Command]());
      });
    });

    const clear = shadow.querySelector(
      '#open-clear-before'
    ) as HTMLInputElement;
    clear.checked = this._state.clear ?? true;

    customElements
      .whenDefined('input-with-unit')
      .then(() => {
        const k_ratio_input = shadow.querySelector(
          '#config-k'
        ) as InputWithUnit;
        config.addEventListener('click', () => {
          const new_k = k_ratio_input.value !== '' ? +k_ratio_input.value : 0;
          this.send(new Uint8Array([Command.CONFIG, ...pack32(new_k)]));
        });

        const freq = shadow.querySelector(
          '#open-freq-receive'
        ) as InputWithUnit;
        freq.value =
          this._state.frequency !== undefined
            ? this._state.frequency.toString()
            : '';
        const limit = shadow.querySelector(
          '#open-limit-receive'
        ) as InputWithUnit;
        limit.value =
          this._state.limit !== undefined ? this._state.limit.toString() : '';

        open_valve.addEventListener('click', () => {
          this._state.frequency = +freq.value;
          this._state.clear = clear.checked;
          this._state.limit = +limit.value;
          this.save_state();

          this.send(
            new Uint8Array([
              Command.OPEN_VALVE,
              clear.checked ? 1 : 0,
              ...pack32(+freq.value, +limit.value),
            ])
          );
        });
      })
      .finally(() => {});

    shadow.querySelector('#save-data')?.addEventListener('click', () => {
      download(
        'control-flow-data.json',
        JSON.stringify(this._data, undefined, 0)
      );
    });

    this.container.on('beforeComponentRelease', () => {
      if (this._ws !== undefined) this._ws.close();
      if (this._graph_component !== undefined)
        this._graph_component.container.close();
    });

    this.container.on('open', () => {
      if (address.value.length > 0 && opt.autoconnect === true)
        this.connect(protocol.value, address.value);
    });

    shadow.querySelector('#time-line-graph')?.addEventListener('click', ev => {
      this.create_graph();
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
      this._ws = new WebSocket(`${protocol}://${addr}/ws`);
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
          const d: ControlFlowResponse = parse(new Uint8Array(ev.data));
          if (!('error' in d)) {
            this._update_info(d);
            this._display.receive(
              JSON.stringify(d),
              ev.data.byteLength,
              ev.data
            );
          } else this.response_error(d);
        } catch (e) {
          this._display.error((e as Error).message);
        }
      };
      this._ws.onclose = ev => {
        // console.log('close', ev);
        this._onclose();
        this._ws = undefined;
        this._display.command(`Socket ${addr} closed [${ev.code}]`);
      };
      this._ws.onerror = ev => {
        this._display.error(`ERROR! Socket error`);
        // console.error('error', ev);
      };
    } catch (e) {
      // console.error('error connecting', e);
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

  private response_error(d: ControlFlowErrorResponse): void {
    this._display.error(
      `ERROR: ${error_name(d.error)} [${d.response as number}]`
    );
  }

  private save_state(): void {
    window.console_app.set_tool_state('control_flow', this._state, true);
  }

  private create_graph(): void {
    if (this._graph_component !== undefined) {
      this._graph_component.container.focus();
      return;
    }
    const margin = { top: 20, bottom: 40, left: 30, right: 40 };
    this._graph_component = this.container.layoutManager.newComponentAtLocation(
      'RLTimeLineGraphComponent',
      [
        {
          margin,
          title: '&#8701; Flow Rate / Volume &#8702;',
        },
        {
          line: {
            stroke: 'yellow',
          },
          circle: {
            stroke: 'yellow',
            fill: 'yellow',
          },
        },
      ],
      'Control Flow Graph'
    )?.component as RLTimeLineGraphComponent;

    const labels = (): void => {
      this._graph_component?.graph
        .x_label('Time')
        .attr('y', margin.bottom)
        .attr('dy', -0.2 * margin.bottom)
        .style('fill', 'black')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle');

      this._graph_component?.graph
        .y_label('Flow Rate (L / min)')
        .attr('dy', -5)
        .attr('transform', 'rotate(90)')
        .style('font-size', '14px')
        .style('fill', 'black')
        .style('font-weight', 'bold')
        .style('text-anchor', 'start');

      this._graph_component?.graph
        .ry_label('Volume (ml)')
        .attr('transform', 'rotate(-90)')
        .attr('dy', -5)
        .style('fill', 'black')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('text-anchor', 'end');
    };

    const tt = new Tooltip(
      this._graph_component.rootHtmlElement,
      (ev, d) =>
        `${time_format((d as DateLineData).date as Date)}: ${(
          (d as DateLineData).value as number
        ).toFixed(2)}`
    );
    const tooltip = (): void => {
      this._graph_component?.graph.set_tooltips(tt);
    };

    labels();
    tooltip();

    this.update_graph();

    this._graph_component.container.on('beforeComponentRelease', () => {
      this._graph_component = undefined;
    });
  }

  private update_graph(): void {
    if (this._graph_component === undefined) return;

    const data = this.compute_graph_data();
    if (data === undefined) return;
    this._graph_component.update([
      [data.flow_instant, data.flow_mean],
      [data.volume],
    ]);
  }

  private compute_data(resp: ControlFlowStateResponse): void {
    const volume = (1000 * resp.pulses) / this._k_ratio;
    if (this._valve_state === State.CLOSE && resp.state === State.OPEN) {
      this._data.push([
        {
          date: new Date(),
          pulses: resp.pulses,
          volume,
          state: resp.state,
          flow_instant: 0,
          flow_mean: 0,
        },
      ]);
    } else if (
      (resp.state === State.OPEN ||
        (resp.state === State.CLOSE && this._valve_state === State.OPEN)) &&
      this._data.length > 0
    ) {
      const d = this._data[this._data.length - 1];
      const init = d[0].date.getTime();
      const before_volume = d[d.length - 1].volume;
      const before_date = d[d.length - 1].date.getTime();
      d.push({
        date: new Date(),
        pulses: resp.pulses,
        volume,
        state: resp.state,
        flow_instant: flow_rate_to_liters_per_minute(
          volume - before_volume,
          before_date,
          Date.now()
        ),
        flow_mean: flow_rate_to_liters_per_minute(volume, init, Date.now()),
      });
    }
  }

  private compute_graph_data(): {
    volume: DateLineData[];
    flow_instant: DateLineData[];
    flow_mean: DateLineData[];
  } {
    if (this._data.length === 0) {
      return {
        volume: [],
        flow_instant: [],
        flow_mean: [],
      };
    }
    const data = this._data[this._data.length - 1];
    const volume = compute_date_line_graph_data(data, 'volume');
    const flow_instant = compute_date_line_graph_data(data, 'flow_instant');
    const flow_mean = compute_date_line_graph_data(data, 'flow_mean');

    return {
      volume,
      flow_instant,
      flow_mean,
    };
  }
}

function state_name(state: State): string {
  return Object.values(State)[state as number] as string;
}

function error_name(error: ErrorDescription): string {
  const val = Object.values(ErrorDescription)[error as number];
  return val !== undefined ? (val as string) : 'Urecognized';
}

function compute_date_line_graph_data(
  data: ControlFlowData[],
  index: keyof ControlFlowData
): DateLineData[] {
  return data.reduce<DateLineData[]>((acc, d) => {
    acc.push({ date: d.date, value: d[index] as number });
    return acc;
  }, []);
}

function flow_rate_to_liters_per_minute(
  volume_ml: number,
  time_init: number,
  time_end: number
): number {
  if (time_end <= time_init) return 0;
  return volume_ml / 1000 / ((time_end - time_init) / 1000 / 60);
}
