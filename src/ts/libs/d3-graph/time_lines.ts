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

interface TimeLineGraphOptions {
  width: number;
  height: number;
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

export interface DateLineData {
  date: Date;
  value: number;
}

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

  constructor() {
    this._svg = d3.create('svg');
    this._g = this._svg.append('g');
    this._x = d3.scaleTime();
    this._y = d3.scaleLinear();
    this._line = d3.line<any>();
    this._x_axis = this._g.append('g');
    this._y_axis = this._g.append('g');
  }

  public draw(
    data: DateLineData[][],
    opt: TimeLineGraphOptions
  ): SVGSVGElement {
    const width = opt.width;
    const height = opt.height;
    const margin = opt.margin ?? { top: 20, bottom: 20, left: 20, right: 20 };
    const curve = opt.curve ?? d3.curveLinear;

    this._style_line = { ...this._style_line, ...opt.line };
    this._style_circle = { ...this._style_circle, ...opt.circle };

    this._style_line['stroke-width'] = value_to_function(
      this._style_line['stroke-width']
    ) as Accessor<number>;
    console.log(
      this._style_line['stroke-width']
      // this._style_line['stroke-width'](undefined, 10)
    );
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
      .x(d => this._x(d.date))
      .y(d => this._y(d.value));

    this._x_axis.attr('transform', `translate(0,${height})`);

    this._g.append('g').classed('--line-area', true);
    this._g.append('g').classed('--circle-area', true);

    return this.update(data);
  }

  public update(data: DateLineData[][]): SVGSVGElement {
    const domain = this.calculate_domain(data);
    this._x.domain(domain.date).nice();
    this._y.domain(domain.value).nice();

    this._x_axis.call(d3.axisBottom(this._x));
    this._y_axis.call(d3.axisLeft(this._y));

    this._g
      .select('.--line-area')
      .selectAll('.--line')
      .data(data)
      .join(enter => enter.append('path').classed('--line', true))
      .style(
        'stroke-width',
        this._style_line['stroke-width'] as Accessor<number>
      )
      .transition()
      .attr('d', this._line)
      .style('fill', 'none')
      .style('stroke', this._style_line.stroke as Accessor<string>);

    for (let i = 0; i < data.length; ++i) {
      this._g
        .select('.--circle-area')
        .selectAll(`.--circle-${i}`)
        .data(data[i])
        .join(enter =>
          enter
            .append('circle')
            .classed(`--circle`, true)
            .classed(`--circle-${i}`, true)
        )
        .attr(
          'stroke',
          attribute_to_value(
            this._style_circle.stroke as AttributeValue<string>,
            i
          )
        )
        .attr(
          'stroke-width',
          attribute_to_value(
            this._style_circle['stroke-width'] as AttributeValue<number>,
            i
          )
        )
        .attr(
          'r',
          attribute_to_value(this._style_circle.r as AttributeValue<number>, i)
        )
        .attr(
          'fill',
          attribute_to_value(
            this._style_circle.fill as AttributeValue<string>,
            i
          )
        )
        .transition()
        .attr('cx', d => this._x(d.date))
        .attr('cy', d => this._y(d.value));
    }

    return this._svg.node() as SVGSVGElement;
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
    date: [Date, Date];
    value: [number, number];
  } {
    return {
      date: calculate_multi_domain<DateLineData, Date>(data, d => d.date),
      value: calculate_multi_domain<DateLineData, number>(data, d => d.value),
    };
  }
}
