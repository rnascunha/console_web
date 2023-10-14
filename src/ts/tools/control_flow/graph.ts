import type {
  Data,
  Time2AxisLineGraphOptions,
} from '../../libs/d3-graph/time_2_axis_line_graph';
import type { Time2AxisLineGraphComponent } from '../../golden-components/time_line_graph';
import { time as time_format } from '../../helper/time';
import { LayoutManager } from 'golden-layout';
import type { ControlFlowData } from './component';

const axis_label_config = {
  attr: {
    fill: 'black',
  },
  style: {
    'font-size': 14,
  },
};

const colors = ['blue', 'red', 'yellow'];
const lcolors = colors.slice(0, 2);
const rcolors = colors.slice(2)[0];

const graph_options: Time2AxisLineGraphOptions = {
  margin: { top: 20, bottom: 40, left: 30, right: 40 },
  line: [
    {
      attr: {
        fill: 'none',
        'stroke-width': 1.5,
        stroke: lcolors,
      },
    },
    {
      attr: {
        fill: 'none',
        'stroke-width': 1.5,
        stroke: rcolors,
      },
    },
  ],
  circle: [
    {
      group: {
        attr: {
          fill: lcolors,
        },
      },
      circle: {
        attr: {
          r: 1,
        },
        transition: {
          duration: 500,
          attr: {
            r: 3,
          },
        },
      },
    },
    {
      group: {
        attr: {
          fill: rcolors,
        },
      },
      circle: {
        attr: {
          r: 1,
        },
        transition: {
          duration: 500,
          attr: {
            r: 3,
          },
        },
      },
    },
  ],
  title: {
    top: {
      text: '&#8701; Flow Rate / Volume &#8702;',
      config: {
        style: {
          fill: 'black',
          'font-size': 16,
          'font-weight': 'bold',
        },
      },
    },
  },
  label: [
    {
      axis: 'left',
      label: 'Flow Rate (L / min)',
      config: {
        position: 'end',
        place: 'inside',
        attr: {
          dy: -4,
          ...axis_label_config.attr,
        },
        style: {
          ...axis_label_config.style,
        },
      },
    },
    {
      axis: 'bottom',
      label: 'Time',
      config: {
        position: 'middle',
        place: 'outside',
        attr: {
          dy: -5,
          ...axis_label_config.attr,
        },
        style: {
          ...axis_label_config.style,
        },
      },
    },
    {
      axis: 'right',
      label: 'Volume (ml)',
      config: {
        position: 'end',
        place: 'inside',
        attr: {
          dy: -4,
          ...axis_label_config.attr,
        },
        style: {
          ...axis_label_config.style,
        },
      },
    },
  ],
  tooltip: {
    on: (ev, d) =>
      `${time_format((d as Data).date)}: ${(d as Data).value.toFixed(1)}`,
    config: { style: { transition: 'opacity 1s' } },
  },
  legend: {
    legends: ['Flow rate instant', 'Flow rate mean', 'Volume'],
    config: {
      x: 25,
      y: 0,
      side: 15,
      dy: 20,
    },
    rect_config: {
      attr: {
        fill: colors,
      },
    },
    legend_config: {},
  },
};

export class ControlFlowGraph {
  private _graph_component?: Time2AxisLineGraphComponent;

  public create_graph(layout: LayoutManager, data: ControlFlowData[][]): void {
    if (this._graph_component !== undefined) {
      this._graph_component.container.focus();
      return;
    }

    this._graph_component = layout.newComponentAtLocation(
      'Time2AxisLineGraphComponent',
      graph_options,
      'Control Flow Graph',
      [
        { typeId: LayoutManager.LocationSelector.TypeId.FirstRowOrColumn },
        { typeId: LayoutManager.LocationSelector.TypeId.FocusedItem },
        { typeId: LayoutManager.LocationSelector.TypeId.FirstStack },
        { typeId: LayoutManager.LocationSelector.TypeId.Root },
      ]
    )?.component as Time2AxisLineGraphComponent;

    this.update_graph(data);

    this._graph_component.container.on('beforeComponentRelease', () => {
      this._graph_component = undefined;
    });
  }

  public update_graph(cfdata: ControlFlowData[][]): void {
    if (this._graph_component === undefined) return;

    const data = this.compute_graph_data(cfdata);
    if (data === undefined) return;
    this._graph_component.update([
      [data.flow_instant, data.flow_mean],
      [data.volume],
    ]);
  }

  private compute_graph_data(cfdata: ControlFlowData[][]): {
    volume: Data[];
    flow_instant: Data[];
    flow_mean: Data[];
  } {
    if (cfdata.length === 0) {
      return {
        volume: [],
        flow_instant: [],
        flow_mean: [],
      };
    }
    const data = cfdata[cfdata.length - 1];
    const volume = compute_date_line_graph_data(data, 'volume');
    const flow_instant = compute_date_line_graph_data(data, 'flow_instant');
    const flow_mean = compute_date_line_graph_data(data, 'flow_mean');

    return {
      volume,
      flow_instant,
      flow_mean,
    };
  }

  public close(): void {
    if (this._graph_component !== undefined)
      this._graph_component.container.close();
  }
}

function compute_date_line_graph_data(
  data: ControlFlowData[],
  index: keyof ControlFlowData
): Data[] {
  return data.reduce<Data[]>((acc, d) => {
    acc.push({ date: d.date, value: d[index] as number });
    return acc;
  }, []);
}
