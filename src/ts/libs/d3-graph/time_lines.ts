import * as d3 from 'd3';
import {
  type Margin,
  type LineStyle,
  type CircleStyle,
  value_to_function,
  attribute_to_value,
  type AttributeValue,
  type Accessor,
} from './types';
import { calculate_multi_domain } from './helper';
import type { Tooltip } from './tooltip';

export interface TimeLineGraphOptions {
  width: number;
  height: number;
  x_index?: number | string;
  y_index?: number | string;
  margin?: Margin;
  curve?: d3.CurveFactory | d3.CurveBundleFactory;
  line?: LineStyle;
  circle?: CircleStyle;
}

const default_line_style: LineStyle = {
  stroke: value_to_function<string>(d3.schemeCategory10),
  'stroke-width': 1.5,
};

const default_circle_style: CircleStyle = {
  r: 2,
  fill: d3.schemeCategory10,
  stroke: d3.schemeCategory10,
  'stroke-width': 1,
};

export type DateLineData = Record<string | number, Date | number>;

export class TimeLinesGraph {
  private readonly _svg: d3.Selection<
    SVGSVGElement,
    undefined,
    null,
    undefined
  >;

  private readonly _g: d3.Selection<SVGGElement, undefined, null, undefined>;
  private readonly _x: d3.ScaleTime<number, number, never>;
  private readonly _y: d3.ScaleLinear<number, number, never>;

  private _style_line: LineStyle = default_line_style;
  private _style_circle: CircleStyle = default_circle_style;

  private readonly _line: d3.Line<any>;

  private readonly _x_axis: d3.Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;

  private readonly _y_axis: d3.Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;

  private _x_index: number | string = 'date';
  private _y_index: number | string = 'value';

  private _tooltips?: Tooltip;

  constructor() {
    this._svg = d3.create('svg');
    this._g = this._svg.append('g');
    this._x = d3.scaleTime();
    this._y = d3.scaleLinear();
    this._line = d3.line<any>();
    this._x_axis = this._g.append('g');
    this._y_axis = this._g.append('g');
  }

  get group(): d3.Selection<SVGGElement, undefined, null, undefined> {
    return this._g;
  }

  get x(): d3.ScaleTime<number, number, never> {
    return this._x;
  }

  public draw(
    data: DateLineData[][],
    opt: TimeLineGraphOptions
  ): SVGSVGElement {
    const width = opt.width;
    const height = opt.height;
    const margin = opt.margin ?? { top: 20, bottom: 20, left: 20, right: 20 };
    const curve = opt.curve ?? d3.curveLinear;

    this._x_index = opt.x_index ?? 'date';
    this._y_index = opt.y_index ?? 'value';

    this._style_line = { ...this._style_line, ...opt.line };
    this._style_circle = { ...this._style_circle, ...opt.circle };

    this._style_line['stroke-width'] = value_to_function(
      this._style_line['stroke-width']
    ) as Accessor<number>;
    this._style_line.stroke = value_to_function(
      this._style_line.stroke
    ) as Accessor<string>;

    this._svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top);

    this._g.attr('transform', `translate(${margin.left}, ${margin.top})`);

    this._x.range([0, width]);
    this._y.range([height, 0]);

    this._line
      .curve(curve)
      .x(d => this._x(d[this._x_index]))
      .y(d => this._y(d[this._y_index]));

    this._x_axis.attr('transform', `translate(0,${height})`);

    this._g.append('g').classed('--line-area', true);
    this._g.append('g').classed('--circle-area', true);

    return this.update(data);
  }

  public update(data: DateLineData[][]): SVGSVGElement {
    const domain = this.calculate_domain(data);
    this._x.domain(domain.x).nice();
    this._y.domain(domain.y).nice();

    this._x_axis.call(d3.axisBottom(this._x));
    this._y_axis.call(d3.axisLeft(this._y));

    draw_lines(
      this._g.select('.--line-area'),
      data,
      this._line,
      this._style_line
    );

    draw_circles(
      this._g.select('.--circle-area'),
      data,
      d => this._x(d[this._x_index]),
      d => this._y(d[this._y_index]),
      this._style_circle,
      this._tooltips?.install.bind(this._tooltips)
    );

    return this._svg.node() as SVGSVGElement;
  }

  public set_tooltips(tooltip: Tooltip): void {
    this._tooltips = tooltip;
  }

  public x_label(
    label: string
  ): d3.Selection<SVGTextElement, undefined, null, undefined> {
    const box = this._x_axis.node()?.getBBox() as SVGRect;
    return this._x_axis
      .append('text')
      .text(label)
      .attr('x', box.width / 2)
      .style('text-anchor', 'middle');
  }

  public y_label(
    label: string
  ): d3.Selection<SVGTextElement, undefined, null, undefined> {
    return this._y_axis.append('text').text(label);
  }

  public style_line(
    name: string,
    value: string | number | boolean
  ): d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> {
    return this._g.selectAll('.--line').style(name, value);
  }

  public style_circle(
    name: string,
    value: string | number | boolean,
    index?: number
  ): d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> {
    return this._g
      .selectAll(index === undefined ? '.--circle' : `.--circle-${index}`)
      .attr(name, value);
  }

  private calculate_domain(data: DateLineData[][]): {
    x: [Date, Date];
    y: [number, number];
  } {
    return {
      x: calculate_multi_domain<DateLineData, Date>(
        data,
        d => d[this._x_index] as Date
      ),
      y: calculate_multi_domain<DateLineData, number>(
        data,
        d => d[this._y_index] as number
      ),
    };
  }
}

export class RightAxisTimeLinesGraph {
  private readonly _g: d3.Selection<SVGGElement, undefined, null, undefined>;
  private readonly _x: d3.ScaleTime<number, number, never>;
  private readonly _y: d3.ScaleLinear<number, number, never>;

  private _style_line: LineStyle = default_line_style;
  private _style_circle: CircleStyle = default_circle_style;

  private readonly _line: d3.Line<any>;

  private readonly _y_axis: d3.Selection<
    SVGGElement,
    undefined,
    null,
    undefined
  >;

  private _x_index: number | string = 'date';
  private _y_index: number | string = 'value';

  private _tooltips?: Tooltip;

  constructor(
    g: d3.Selection<SVGGElement, undefined, null, undefined>,
    x: d3.ScaleTime<number, number, never>
  ) {
    this._g = g;
    this._x = x;
    this._y = d3.scaleLinear();
    this._line = d3.line<any>();
    this._y_axis = this._g.append('g');
  }

  public draw(data: DateLineData[][], opt: TimeLineGraphOptions): void {
    const width = opt.width;
    const height = opt.height;
    const curve = opt.curve ?? d3.curveLinear;

    this._x_index = opt.x_index ?? 'date';
    this._y_index = opt.y_index ?? 'value';

    this._style_line = { ...this._style_line, ...opt.line };
    this._style_circle = { ...this._style_circle, ...opt.circle };

    this._style_line['stroke-width'] = value_to_function(
      this._style_line['stroke-width']
    ) as Accessor<number>;
    this._style_line.stroke = value_to_function(
      this._style_line.stroke
    ) as Accessor<string>;

    this._y.range([height, 0]);

    this._y_axis.attr('transform', `translate(${width},0)`);

    this._line
      .curve(curve)
      .x(d => this._x(d[this._x_index]))
      .y(d => this._y(d[this._y_index]));

    this._g.append('g').classed('--line-right-area', true);
    this._g.append('g').classed('--circle-right-area', true);

    this.update(data);
  }

  public update(data: DateLineData[][]): void {
    const domain = this.calculate_domain(data);
    this._y.domain(domain.y).nice();

    this._y_axis.call(d3.axisRight(this._y));

    draw_lines(
      this._g.select('.--line-right-area'),
      data,
      this._line,
      this._style_line
    );

    draw_circles(
      this._g.select('.--circle-right-area'),
      data,
      d => this._x(d[this._x_index]),
      d => this._y(d[this._y_index]),
      this._style_circle,
      this._tooltips?.install.bind(this._tooltips)
    );
  }

  public set_tooltips(tooltip: Tooltip): void {
    this._tooltips = tooltip;
  }

  public ry_label(
    label: string
  ): d3.Selection<SVGTextElement, undefined, null, undefined> {
    return this._y_axis.append('text').text(label);
  }

  public style_line(
    name: string,
    value: string | number | boolean
  ): d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> {
    return this._g.selectAll('.--line').style(name, value);
  }

  public style_circle(
    name: string,
    value: string | number | boolean,
    index?: number
  ): d3.Selection<d3.BaseType, unknown, SVGGElement, undefined> {
    return this._g
      .selectAll(index === undefined ? '.--circle' : `.--circle-${index}`)
      .attr(name, value);
  }

  private calculate_domain(data: DateLineData[][]): {
    y: [number, number];
  } {
    return {
      y: calculate_multi_domain<DateLineData, number>(
        data,
        d => d[this._y_index] as number
      ),
    };
  }
}

export class RLTimeLinesGraph {
  private readonly _graph: TimeLinesGraph;
  private readonly _rgraph: RightAxisTimeLinesGraph;

  constructor() {
    this._graph = new TimeLinesGraph();
    this._rgraph = new RightAxisTimeLinesGraph(
      this._graph.group,
      this._graph.x
    );
  }

  public draw(
    data: [DateLineData[][], DateLineData[][]],
    opt: [TimeLineGraphOptions, TimeLineGraphOptions]
  ): SVGSVGElement {
    const svg = this._graph.draw(data[0], opt[0]);
    this._rgraph.draw(data[1], opt[1]);
    return svg;
  }

  public update(data: [DateLineData[][], DateLineData[][]]): SVGSVGElement {
    const svg = this._graph.update(data[0]);
    this._rgraph.update(data[1]);
    return svg;
  }

  public set_tooltips(tooltip: Tooltip): void {
    this._graph.set_tooltips(tooltip);
    this._rgraph.set_tooltips(tooltip);
  }

  public x_label(
    label: string
  ): d3.Selection<SVGTextElement, undefined, null, undefined> {
    return this._graph.x_label(label);
  }

  public y_label(
    label: string
  ): d3.Selection<SVGTextElement, undefined, null, undefined> {
    return this._graph.y_label(label);
  }

  public ry_label(
    label: string
  ): d3.Selection<SVGTextElement, undefined, null, undefined> {
    return this._rgraph.ry_label(label);
  }
}

function draw_lines(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: DateLineData[][],
  line: d3.Line<any>,
  style_line: LineStyle
): void {
  select
    .selectAll('.--line')
    .data(data)
    .join(enter => enter.append('path').classed('--line', true))
    .style('stroke-width', style_line['stroke-width'] as Accessor<number>)
    .transition()
    .attr('d', line)
    .style('fill', 'none')
    .style('stroke', style_line.stroke as Accessor<string>);
}

function draw_circles(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: DateLineData[][],
  x: (d: DateLineData) => number,
  y: (d: DateLineData) => number,
  style_circle: CircleStyle,
  call?: (
    d: d3.Selection<SVGCircleElement, DateLineData, SVGElement, undefined>
  ) => any
): void {
  for (let i = 0; i < data.length; ++i) {
    select
      .selectAll(`.--circle-${i}`)
      .data(data[i])
      .join(enter =>
        enter
          .append('circle')
          .classed(`--circle`, true)
          .classed(`--circle-${i}`, true)
          .call(call === undefined ? () => {} : call)
      )
      .attr(
        'stroke',
        attribute_to_value(style_circle.stroke as AttributeValue<string>, i)
      )
      .attr(
        'stroke-width',
        attribute_to_value(
          style_circle['stroke-width'] as AttributeValue<number>,
          i
        )
      )
      .attr(
        'r',
        attribute_to_value(style_circle.r as AttributeValue<number>, i)
      )
      .attr(
        'fill',
        attribute_to_value(style_circle.fill as AttributeValue<string>, i)
      )
      .transition()
      .attr('cx', x)
      .attr('cy', y);
  }
}
