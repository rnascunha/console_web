import * as d3 from 'd3';
import { curves } from '../../ts/libs/d3-graph/types';
import { time as time_format } from '../../ts/helper/time';
import { BrushX } from '../../ts/libs/d3-graph/brush';
import {
  domain_to_range,
  range_to_domain,
  get_dimensions,
} from '../../ts/libs/d3-graph/helper';

import {
  Time2AxisLineGraph,
  type Data,
  type Time2AxisLineGraphOptions,
  type LineConfig,
} from '../../ts/libs/d3-graph/time_2_axis_line_graph';

const $ = document.querySelector.bind(document);

const graph_el = $('#graph') as HTMLElement;
const graph_brush_el = $('#graph-brush') as HTMLElement;
const value = $('#value') as HTMLInputElement;
const add = $('#add') as HTMLElement;
const clear = $('#clear') as HTMLElement;
const remove_first = $('#remove-first') as HTMLElement;
const remove_last = $('#remove-last') as HTMLElement;
const random = $('#random') as HTMLElement;
const random_check = $('#random-after') as HTMLInputElement;
const random_all = $('#random-all') as HTMLElement;
const line_opts = $('#lines-options') as HTMLSelectElement;
const stroke_width = $('#stroke-width') as HTMLInputElement;

const number_lines = 2;

const graph = new Time2AxisLineGraph();
const graph_brush = new Time2AxisLineGraph();
const brush = new BrushX();
// const zoom = d3.zoom<SVGSVGElement, undefined>();

const data: Data[][] = [];
const data2: Data[][] = [];

const axis_label_config = {
  attr: {
    fill: 'black',
  },
  style: {
    'font-size': 14,
  },
};

const graph_config: Time2AxisLineGraphOptions = {
  // zoom: true,
  margin: { top: 20, bottom: 40, left: 40, right: 40 },
  config: {
    attr: {
      fill: 'white',
    },
  },
  line: [
    {
      curve: d3.curveLinear,
      attr: {
        'stroke-width': 1.5,
        stroke: d3.schemeCategory10,
      },
    },
    {
      curve: d3.curveLinear,
      attr: {
        'stroke-width': 1.5,
        stroke: d3.schemeCategory10.slice(number_lines),
      },
    },
  ],
  circle: [
    {
      group: {
        attr: {
          fill: d3.schemeCategory10,
        },
      },
      circle: {
        attr: {
          r: 5,
        },
        transition: {
          duration: 1000,
          attr: {
            // r: (d, i) => 1 + 1 * i,
            r: 5,
          },
        },
      },
    },
    {
      group: {
        attr: {
          fill: d3.schemeCategory10.slice(2),
        },
      },
      circle: {
        attr: {
          r: 5,
        },
        transition: {
          duration: 2000,
          attr: {
            r: 5,
            fill: d3.schemeDark2,
          },
        },
      },
    },
  ],
  title: {
    top: {
      text: 'Top Title',
      config: {
        style: {
          fill: 'black',
          'font-size': 16,
        },
      },
    },
    bottom: {
      text: 'Bottom Title',
      config: {
        style: {
          fill: 'black',
          'font-size': 16,
        },
      },
    },
  },
  axis: {
    x: true,
    y: true,
    y2: true,
  },
  label: [
    {
      axis: 'left',
      label: 'Left Start Outside',
      config: {
        position: 'start',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'left',
      label: 'Left Middle Outside',
      config: {
        position: 'middle',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'left',
      label: 'Left End Outside',
      config: {
        position: 'end',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'left',
      label: 'Left Start Inside',
      config: {
        position: 'start',
        place: 'inside',
        ...axis_label_config,
      },
    },
    {
      axis: 'left',
      label: 'Left Middle Inside',
      config: {
        position: 'middle',
        place: 'inside',
        ...axis_label_config,
      },
    },
    {
      axis: 'left',
      label: 'Left End Inside',
      config: {
        position: 'end',
        place: 'inside',
        ...axis_label_config,
      },
    },
    {
      axis: 'left',
      label: 'Left Top',
      config: {
        position: 'start',
        place: 'top',
        ...axis_label_config,
      },
    },
    {
      axis: 'bottom',
      label: 'Start Bottom Outside',
      config: {
        position: 'start',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'bottom',
      label: 'Middle Bottom Outside',
      config: {
        position: 'middle',
        place: 'outside',
        attr: {
          ...axis_label_config.attr,
          dy: -12,
        },
        style: {
          ...axis_label_config.style,
        },
      },
    },
    {
      axis: 'bottom',
      label: 'Middle Bottom Outside',
      config: {
        position: 'end',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right Start Outside',
      config: {
        position: 'start',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right Middle Outside',
      config: {
        position: 'middle',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right End Outside',
      config: {
        position: 'end',
        place: 'outside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right Start Inside',
      config: {
        position: 'start',
        place: 'inside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right Middle Inside',
      config: {
        position: 'middle',
        place: 'inside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right End Inside',
      config: {
        position: 'end',
        place: 'inside',
        ...axis_label_config,
      },
    },
    {
      axis: 'right',
      label: 'Right Top',
      config: {
        position: 'start',
        place: 'top',
        ...axis_label_config,
      },
    },
  ],
  tooltip: {
    on: (ev, d) => `${time_format((d as Data).date)}: ${(d as Data).value}`,
    config: { style: { transition: 'opacity 0.5s' } },
  },
  legend: {
    legends: ['legend 0', 'legend 1', 'legend 2'],
    config: {
      x: 20,
      y: 20,
      side: 15,
      dy: 20,
    },
    rect_config: {
      attr: {
        fill: d3.schemeCategory10,
      },
    },
    legend_config: {
      style: {
        fill: d3.schemeCategory10,
        'font-size': 20,
      },
    },
  },
};

const graph_brush_config: Time2AxisLineGraphOptions = {
  margin: { top: 0, bottom: 20, left: 40, right: 40 },
  config: {
    attr: {
      fill: 'white',
    },
  },
  line: [
    {
      curve: d3.curveLinear,
      attr: {
        'stroke-width': 1.5,
        stroke: d3.schemeCategory10,
      },
    },
    {
      curve: d3.curveLinear,
      attr: {
        'stroke-width': 1.5,
        stroke: d3.schemeCategory10.slice(number_lines),
      },
    },
  ],
  axis: {
    x: true,
  },
};

Object.entries(curves)
  // .filter(([k, v]) => !v.is_close)
  .forEach(([k, v]) => {
    line_opts.appendChild(new Option(k, `${k}`, undefined, k === 'linear'));
  });

random.addEventListener('click', () => {
  randonize();
});

line_opts.addEventListener('change', () => {
  (graph_config.line as LineConfig[])[0].curve = curves[line_opts.value].line;
  create_graph();
});

stroke_width.addEventListener('change', () => {
  // eslint-disable-next-line
  (graph_config.line as LineConfig[])[1].attr!['stroke-width'] =
    stroke_width.value;

  create_graph();
});

add.addEventListener('click', () => {
  if (data.length === 0) {
    create_data();
    update_graph();
    return;
  }

  [data, data2].forEach((dd, ii) => {
    dd.forEach((d, i) => {
      d.push({
        date: new Date(),
        value: ii === 0 && i === 0 ? +value.value : simple_random(),
      });
    });
  });

  if (random_check.checked) randonize();

  update_graph();
  if (random_check.checked) randonize();
});

random_all.addEventListener('click', () => {
  randonize_all_values();
  update_graph();
});

clear.addEventListener('click', () => {
  create_data();
  update_graph();
});

remove_first.addEventListener('click', () => {
  [data, data2].forEach(dd => {
    dd.forEach(d => {
      d.splice(0, 1);
    });
  });
  update_graph();
});

remove_last.addEventListener('click', () => {
  [data, data2].forEach(dd => {
    dd.forEach(d => {
      d.splice(d.length - 1, 1);
    });
  });
  update_graph();
});

randonize();
add_data(100, 10000);
create_graph();

/***********************************/
// Functions
/***********************************/

function update_graph(): void {
  const select = d3.brushSelection(graph_brush.group.node() as SVGGElement) as
    | [number, number]
    | null;
  const is_end = select !== null && select[1] === graph.x.scale.range()[1];

  graph_brush.data(data, data2);
  if (is_end) graph.focus(range_to_domain(graph_brush.x, select));
  graph.data(data, data2);
  if (!is_end)
    brush.set_focus(
      graph_brush.group,
      domain_to_range(graph_brush.x, graph.get_focus())
    );
}

function create_graph(): void {
  graph_el.innerHTML = '';
  graph_el.appendChild(
    graph.draw(graph_el, graph_config).data(data, data2).node() as SVGSVGElement
  );

  graph_brush_el.innerHTML = '';
  graph_brush_el.appendChild(
    graph_brush
      .draw(graph_brush_el, graph_brush_config)
      .data(data, data2)
      .node() as SVGSVGElement
  );
  const { width, height } = get_dimensions(
    graph_brush_el,
    graph_brush_config.margin
  );
  brush.draw(graph_brush.group, width, height);
  brush.on('brush', () => {
    graph.focus(brush.focus(graph_brush.x));
    update_graph();
  });

  // const dz = get_dimensions(graph_el, graph_config.margin);
  // const E = [
  //   [0, 0],
  //   [dz.width, dz.height],
  // ] as [[number, number], [number, number]];
  // zoom
  //   .scaleExtent([1, 2])
  //   .extent(E)
  //   .translateExtent(E)
  //   .on('zoom', event => {
  //     // console.log('zoom', event);
  //     const xz = event.transform.rescaleX(graph.x.scale);
  //     if (!isNaN(xz.domain()[0])) graph.focus(xz.domain());
  //     else graph.focus(null);
  //     console.log(
  //       'diff',
  //       (xz.domain()[0] as Date).getTime() - (xz.domain()[1] as Date).getTime()
  //     );
  //     graph.data(data, data2);
  //   });

  // graph.node.call(zoom).transition().duration(100).call(zoom.scaleTo, 1);
}

function simple_random(): number {
  return Math.floor(100 * Math.random());
}

function randonize(): void {
  value.value = simple_random().toString();
}

function randonize_all_values(): void {
  [data, data2].forEach(dd => {
    for (const arr of dd) {
      arr.forEach(d => {
        d.value = simple_random();
      });
    }
  });
}

function create_data(): void {
  data.splice(0, data.length);
  for (let i = 0; i < number_lines; ++i)
    data.push([{ date: new Date(), value: simple_random() }]);

  data2.splice(0, data2.length);
  data2.push([{ date: new Date(), value: simple_random() }]);
}

window.addEventListener('resize', ev => {
  graph.draw(graph_el, graph_config).data(data, data2);
});

function add_data(count: number, interval: number): void {
  const now = Date.now() - count * interval;

  if (data.length === 0) data.push([], []);
  if (data2.length === 0) data2.push([]);

  for (let i = 0; i < count; ++i) {
    data[0].push({
      date: new Date(now + i * interval),
      value: simple_random(),
    });
    data[1].push({
      date: new Date(now + i * interval),
      value: simple_random(),
    });
    data2[0].push({
      date: new Date(now + i * interval),
      value: simple_random(),
    });
  }
}
