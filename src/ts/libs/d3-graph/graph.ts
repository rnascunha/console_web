import * as d3 from 'd3';
import { ScaleLinear, ScaleTime } from './scale';
import { calculate_multi_domain } from './helper';
import { Axis } from './axis';
import { type ElementConfig, element_config } from './attributes';
import { Tooltip2 } from './tooltip';
import { time as time_format } from '../../helper/time';
import * as title from './title';

export interface Data {
  date: Date;
  value: number;
}

interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface GraphOptions {
  margin: Margin;
}

export class Graph {
  private readonly _svg: d3.Selection<
    SVGSVGElement,
    undefined,
    null,
    undefined
  >;

  private readonly _g: d3.Selection<SVGGElement, undefined, null, undefined>;

  private readonly _x: ScaleTime;
  private readonly _y: ScaleLinear;
  private readonly _y2: ScaleLinear;

  private readonly _x_axis: Axis<Date>;
  private readonly _y_axis: Axis<number>;

  private readonly _x2_axis: Axis<Date>;
  private readonly _y2_axis: Axis<number>;

  private readonly _line: d3.Line<Data>;
  private readonly _line2: d3.Line<Data>;

  private readonly _tooltip: Tooltip2;

  constructor() {
    this._svg = d3.create('svg');
    this._g = this._svg.append('g');

    this._x = new ScaleTime(calculate_multi_domain<Data, Date>);
    this._y = new ScaleLinear(calculate_multi_domain<Data, number>);
    this._y2 = new ScaleLinear(calculate_multi_domain<Data, number>);

    this._x_axis = new Axis<Date>(this._g.node() as SVGElement);
    this._y_axis = new Axis<number>(this._g.node() as SVGElement);

    this._x2_axis = new Axis<Date>(this._g.node() as SVGElement);
    this._y2_axis = new Axis<number>(this._g.node() as SVGElement);

    this._line = d3.line<Data>();
    this._line2 = d3.line<Data>();

    this._tooltip = new Tooltip2(
      (ev, d) => `${time_format((d as Data).date)}: ${(d as Data).value}`
    );

    this._g.append('g').classed('--line-area', true);
    this._g.append('g').classed('--circle-area', true);

    this._g.append('g').classed('--line-area-right', true);
    this._g.append('g').classed('--circle-area-right', true);
  }

  public draw(container: HTMLElement, opt: GraphOptions): Graph {
    const dim = getComputedStyle(container);

    const rwidth =
      container.clientWidth -
      parseInt(dim.paddingLeft) -
      parseInt(dim.paddingRight);

    const rheight =
      container.clientHeight -
      parseInt(dim.paddingTop) -
      parseInt(dim.paddingBottom);

    const width = rwidth - opt.margin.left - opt.margin.right;
    const height = rheight - opt.margin.top - opt.margin.bottom;

    this._svg.attr('width', rwidth).attr('height', rheight);

    this._g.attr(
      'transform',
      `translate(${opt.margin.left}, ${opt.margin.top})`
    );

    this._tooltip.draw(container, { transition: 'opacity 2s' });

    this._x.draw([0, width]);
    this._y.draw([height, 0]);
    this._y2.draw([height, 0]);

    this._x_axis.draw('bottom', width, height);
    this._y_axis.draw('left', width, height);

    this._x2_axis.draw('top', width, height);
    this._y2_axis.draw('right', width, height);

    this._line
      .curve(d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y.scale(d.value));

    this._line2
      .curve(d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y2.scale(d.value));

    this.draw_labels(width, height, opt.margin);
    this.draw_titles(rwidth, rheight);

    return this;
  }

  public data(
    data: readonly Data[][],
    data2: readonly Data[][]
  ): d3.Selection<SVGSVGElement, undefined, null, undefined> {
    this._x.data(data, (d: Data) => d.date);
    this._y.data(data, (d: Data) => d.value);
    this._y2.data(data2, (d: Data) => d.value);

    this._x_axis.data(this._x.scale);
    this._y_axis.data(this._y.scale);

    this._x2_axis.data(this._x.scale);
    this._y2_axis.data(this._y2.scale);

    this.draw_lines('.--line-area', data, this._line, d3.schemeCategory10);
    this.draw_lines('.--line-area-right', data2, this._line2, 'yellow');

    this.draw_circles(
      '.--circle-area',
      data,
      d => this._x.scale(d.date),
      d => this._y.scale(d.value),
      d3.schemeCategory10
    );

    this.draw_circles(
      '.--circle-area-right',
      data2,
      d => this._x.scale(d.date),
      d => this._y2.scale(d.value),
      'yellow'
    );

    return this._svg;
  }

  private draw_lines(
    class_area: string,
    data: readonly Data[][],
    line: d3.Line<Data>,
    stroke: string | readonly string[]
  ): void {
    draw_lines(this._g.select(class_area), data, line, {
      attr: {
        fill: 'none',
      },
      style: {
        'stroke-width': 1.5,
        stroke,
      },
    });
  }

  private draw_circles(
    class_area: string,
    data: readonly Data[][],
    x: (d: Data) => number,
    y: (d: Data) => number,
    color: string | readonly string[]
  ): void {
    draw_circles(
      this._g.select(class_area),
      data,
      x,
      y,
      {
        attr: {
          fill: color,
        },
      },
      (
        select: d3.Selection<
          SVGCircleElement,
          Data,
          SVGGElement | d3.BaseType,
          Data[]
        >
      ) => {
        element_config(select, {
          style: {
            r: 1,
          },
          transition: {
            duration: 2000,
            style: {
              r: 10,
            },
          },
        });
        this._tooltip.data<Data, SVGGElement | d3.BaseType>(select);
      }
    );
  }

  private draw_labels(width: number, height: number, margin: Margin): void {
    const font_size = '14px';
    const dim = { width, height, margin };

    this._y_axis.label('Top left', dim, {
      place: 'top',
      style: { 'font-size': font_size },
    });

    this._y2_axis.label('Top right', dim, {
      place: 'top',
      style: { 'font-size': font_size },
    });

    this._y_axis.label('Start Outside Left', dim, {
      place: 'outside',
      position: 'start',
      style: {
        'font-size': font_size,
      },
    });

    this._y_axis.label('Start Inside Left', dim, {
      place: 'inside',
      position: 'start',
      style: {
        'font-size': font_size,
      },
    });

    this._y_axis.label('Middle Outside Left', dim, {
      place: 'outside',
      position: 'middle',
      style: {
        'font-size': font_size,
      },
    });

    this._y_axis.label('Middle Inside Left', dim, {
      place: 'inside',
      position: 'middle',
      style: {
        'font-size': font_size,
      },
    });

    this._y_axis.label('End Outside Left', dim, {
      place: 'outside',
      position: 'end',
      style: {
        'font-size': font_size,
      },
    });

    this._y_axis.label('end inside Left', dim, {
      place: 'inside',
      position: 'end',
      style: {
        'font-size': font_size,
      },
    });

    this._x_axis.label('Middle Outside Bottom', dim, {
      place: 'outside',
      position: 'middle',
      style: {
        'font-size': font_size,
      },
    });

    this._x_axis.label('Start Outside Bottom', dim, {
      place: 'outside',
      position: 'start',
      style: {
        'font-size': font_size,
      },
    });

    this._x_axis.label('End Outside Bottom', dim, {
      place: 'outside',
      position: 'end',
      style: {
        'font-size': font_size,
      },
    });

    this._y2_axis.label('Start Inside Right', dim, {
      place: 'inside',
      position: 'start',
      style: {
        'font-size': font_size,
      },
    });

    this._y2_axis.label('End Inside Right', dim, {
      place: 'inside',
      position: 'end',
      style: {
        'font-size': font_size,
      },
    });

    this._y2_axis.label('Middle Inside Right', dim, {
      place: 'inside',
      position: 'middle',
      style: {
        'font-size': font_size,
      },
    });

    this._y2_axis.label('Start Outside Right', dim, {
      place: 'outside',
      position: 'start',
      style: {
        'font-size': font_size,
      },
    });

    this._y2_axis.label('End Outside Right', dim, {
      place: 'outside',
      position: 'end',
      style: {
        'font-size': font_size,
      },
    });

    this._y2_axis.label('Middle Outside Right', dim, {
      place: 'outside',
      position: 'middle',
      style: {
        'font-size': font_size,
      },
    });
  }

  private draw_titles(width: number, height: number): void {
    title.title_top(this._svg, 'TOP Title', width, {
      attr: {
        fill: 'black',
      },
      style: {
        'font-size': '16px',
      },
    });

    title.title_bottom(this._svg, 'BOTTOM Title', width, height, {
      attr: {
        fill: 'black',
      },
      style: {
        'font-size': '16px',
      },
    });
  }
}

function draw_lines<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  line: d3.Line<T>,
  config: ElementConfig
): void {
  select
    .selectAll('path')
    .data(data)
    .join(enter => enter.append('path'))
    .call(element_config, config)
    .attr('d', line);
}

type Callable<Base, T, P = undefined> = (
  select: d3.Selection<Base & d3.BaseType, T, SVGGElement | d3.BaseType, P>,
  ...args: any
) => void;

function draw_circles<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  x: (d: T) => number,
  y: (d: T) => number,
  config_g: ElementConfig,
  on_enter: Callable<SVGCircleElement, T, T[]>
): void {
  select
    .selectAll('g.--dot')
    .data(data)
    .join(enter => enter.append('g').classed('--dot', true))
    .call(element_config, { attr: config_g.attr })
    .selectAll('circle')
    .data(d => d)
    .join(enter => enter.append('circle').call(on_enter))
    .attr('cx', x)
    .attr('cy', y);
}
