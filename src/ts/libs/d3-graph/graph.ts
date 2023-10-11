import * as d3 from 'd3';
import { Scale } from './scale';
import { calculate_multi_domain } from './helper';
import { Axis, AxisPosition } from './axis';
import { type ElementConfig, element_config } from './attributes';
import { Tooltip2 } from './tooltip';
import { time as time_format } from '../../helper/time';

export interface Data {
  date: Date;
  value: number;
}

class ScaleX extends Scale<Date, d3.ScaleTime<number, number, never>> {}
class ScaleY extends Scale<number, d3.ScaleLinear<number, number, never>> {}

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

  private readonly _x: ScaleX;
  private readonly _y: ScaleY;

  private readonly _x_axis: Axis<Date>;
  private readonly _y_axis: Axis<number>;

  private readonly _x2_axis: Axis<Date>;
  private readonly _y2_axis: Axis<number>;

  private readonly _line: d3.Line<any>;

  private readonly _tooltip: Tooltip2;

  constructor() {
    this._svg = d3.create('svg');
    this._g = this._svg.append('g');

    this._x = new ScaleX(d3.scaleTime(), calculate_multi_domain<Data, Date>);
    this._y = new ScaleY(
      d3.scaleLinear(),
      calculate_multi_domain<Data, number>
    );

    this._x_axis = new Axis<Date>(this._g.node() as SVGElement);
    this._y_axis = new Axis<number>(this._g.node() as SVGElement);

    this._x2_axis = new Axis<Date>(this._g.node() as SVGElement);
    this._y2_axis = new Axis<number>(this._g.node() as SVGElement);

    this._line = d3.line<any>();

    this._tooltip = new Tooltip2(
      (ev, d) => `${time_format((d as Data).date)}: ${(d as Data).value}`
    );

    this._g.append('g').classed('--line-area', true);
    this._g.append('g').classed('--circle-area', true);
  }

  public draw(container: HTMLElement, opt: GraphOptions): Graph {
    const width = container.clientWidth - opt.margin.left - opt.margin.right;
    const height = container.clientHeight - opt.margin.top - opt.margin.bottom;

    this._svg
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight);

    this._g.attr(
      'transform',
      `translate(${opt.margin.left}, ${opt.margin.top})`
    );

    this._tooltip.draw(container, { transition: 'opacity 2s' });

    this._x.draw([0, width]);
    this._y.draw([height, 0]);

    this._x_axis.draw(AxisPosition.BOTTOM, width, height);
    this._y_axis.draw(AxisPosition.LEFT, width, height);

    this._x2_axis.draw(AxisPosition.TOP, width, height);
    this._y2_axis.draw(AxisPosition.RIGHT, width, height);

    this._line
      .curve(d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y.scale(d.value));

    return this;
  }

  public data(
    data: readonly Data[][]
  ): d3.Selection<SVGSVGElement, undefined, null, undefined> {
    this._x.data(data, (d: Data) => d.date);
    this._y.data(data, (d: Data) => d.value);

    this._x_axis.data(this._x.scale);
    this._y_axis.data(this._y.scale);

    this._x2_axis.data(this._x.scale);
    this._y2_axis.data(this._y.scale);

    draw_lines(this._g.select('.--line-area'), data, this._line, {
      attr: {
        fill: 'none',
      },
      style: {
        'stroke-width': 1.5,
        stroke: d3.schemeCategory10,
      },
    });

    draw_circles(
      this._g.select('.--circle-area'),
      data,
      d => this._x.scale(d.date),
      d => this._y.scale(d.value),
      {
        attr: {
          fill: d3.schemeCategory10,
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
              r: 5,
            },
          },
        });
        this._tooltip.data<Data, SVGGElement | d3.BaseType>(select);
      }
    );

    return this._svg;
  }
}

function draw_lines<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  line: d3.Line<any>,
  config: ElementConfig
): void {
  select
    .selectAll('path')
    .data(data)
    .join(enter => enter.append('path'))
    .call(element_config, config)
    .transition()
    .attr('d', line);
}

type Callable<T, P = undefined> = (
  select: d3.Selection<SVGCircleElement, T, SVGGElement | d3.BaseType, P>,
  ...args: any
) => void;

function draw_circles<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  x: (d: T) => number,
  y: (d: T) => number,
  config: ElementConfig,
  on_enter: Callable<T, T[]>,
  ...args: any
): void {
  select
    .selectAll('g.--dot')
    .data(data)
    .join(enter => enter.append('g').classed('--dot', true))
    .call(element_config, { attr: config.attr })
    .selectAll('circle')
    .data(d => d)
    .join(enter => enter.append('circle').call(on_enter, ...args))
    .attr('cx', x)
    .attr('cy', y);
}
