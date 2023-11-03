import * as d3 from 'd3';
import { ScaleLinear, ScaleTime } from './scale';
import { extent_multi_domain, get_dimensions } from './helper';
import { Axis, type LabelConfig } from './axis';
import { type ElementConfig, element_config } from './attributes';
import { Tooltip, type CallTooltip } from './tooltip';
import { draw_circles, draw_lines } from './shapes';
import { title, type TitlePosition } from './title';
import {
  type AxisPosition,
  type Dimension,
  type Margin,
  default_classes,
} from './types';
import { type LegendConfig, draw_legend } from './legend';
import { zoom } from './zoom';

export interface Data {
  date: Date;
  value: number;
}

export interface LineConfig extends ElementConfig<d3.BaseType, Data[]> {
  curve?: d3.CurveFactory | d3.CurveFactoryLineOnly;
}

interface CircleConfig {
  group: ElementConfig<d3.BaseType, Data[]>;
  circle: ElementConfig<d3.BaseType, Data>;
}

type AxisType = 'x' | 'x2' | 'y' | 'y2';
type AxisConfig = Partial<Record<AxisType, boolean>>;

interface AxisLabelConfig {
  axis: AxisPosition;
  label: string;
  config: LabelConfig;
}

interface TitleConfig {
  text: string;
  config: ElementConfig<SVGTextElement>;
}

export interface Time2AxisLineGraphOptions {
  margin: Margin;
  config?: ElementConfig;
  line?: LineConfig | [LineConfig, LineConfig];
  circle?: CircleConfig | [CircleConfig, CircleConfig];
  tooltip?: {
    on: CallTooltip;
    config?: ElementConfig<HTMLDivElement>;
  };
  title?: Partial<Record<TitlePosition, TitleConfig>>;
  axis?: AxisConfig;
  label?: AxisLabelConfig[];
  legend?: {
    legends: string[];
    config: LegendConfig;
    rect_config: ElementConfig<SVGRectElement, string>;
    legend_config: ElementConfig<SVGTextElement, string>;
  };
  zoom?: boolean;
}

const default_line_config = {
  curve: d3.curveLinear,
  attr: {
    fill: 'none',
    'stroke-width': 1.5,
    stroke: d3.schemeCategory10,
  },
};

let id = 0;

export class Time2AxisLineGraph {
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

  private readonly _axis: Partial<Record<AxisType, Axis<Date> | Axis<number>>>;

  private readonly _line: d3.Line<Data>;
  private readonly _line2: d3.Line<Data>;

  private readonly _tooltip: Tooltip;

  private _line_config: [LineConfig, LineConfig];
  private _circle_config?: [CircleConfig, CircleConfig];

  private _focus?: [Date, Date];

  constructor() {
    this._svg = d3.create('svg');
    this._g = this._svg.append('g');

    this._x = new ScaleTime(extent_multi_domain<Data, Date>);
    this._y = new ScaleLinear(extent_multi_domain<Data, number>);
    this._y2 = new ScaleLinear(extent_multi_domain<Data, number>);

    this._axis = {};

    this._line = d3.line<Data>();
    this._line2 = d3.line<Data>();

    this._tooltip = new Tooltip();

    this._line_config = [default_line_config, default_line_config];

    const uid = id++;

    this._svg
      .append('defs')
      .append('clipPath')
      .attr('id', `--clip-${uid}`)
      .append('rect');

    this._g
      .append('g')
      .classed(default_classes.line_area, true)
      .attr('clip-path', `url(#--clip-${uid}`);
    this._g.append('g').classed(default_classes.circle_area, true);

    this._g
      .append('g')
      .classed(default_classes.line_area_right, true)
      .attr('clip-path', `url(#--clip-${uid}`);
    this._g.append('g').classed(default_classes.circle_area_right, true);
  }

  get node(): d3.Selection<SVGSVGElement, undefined, null, undefined> {
    return this._svg;
  }

  get x(): ScaleTime {
    return this._x;
  }

  get group(): d3.Selection<SVGGElement, undefined, null, undefined> {
    return this._g;
  }

  public focus(f?: [Date, Date]): void {
    this._focus = f;
  }

  public draw(container: HTMLElement, opt: Time2AxisLineGraphOptions): this {
    const { width, height, margin } = get_dimensions(container, opt.margin);
    const full_width = width + margin.right + margin.left;
    const full_height = height + margin.bottom + margin.top;

    this._svg
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('viewBox', [0, 0, full_width, full_height]);

    this._svg
      .select('defs clipPath rect')
      .attr('width', width)
      .attr('height', height);

    if (opt.zoom === true) zoom(this._svg, this._g, { width, height, margin });

    if (opt.config !== undefined)
      element_config<SVGSVGElement>(this._svg, opt.config);

    this._g.attr('transform', `translate(${margin.left}, ${margin.top})`);

    if (opt.tooltip !== undefined)
      this._tooltip.draw(container, opt.tooltip.on, opt.tooltip.config ?? {});

    this._x.draw([0, width]);
    this._y.draw([height, 0]);
    this._y2.draw([height, 0]);

    if (opt.axis !== undefined) this.draw_axis(opt.axis, width, height);

    if (opt.line !== undefined) {
      if (Array.isArray(opt.line)) this._line_config = opt.line;
      else this._line_config = [opt.line, opt.line];
    }

    this._line
      .curve(this._line_config[0].curve ?? d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y.scale(d.value));

    this._line2
      .curve(this._line_config[1].curve ?? d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y2.scale(d.value));

    if (opt.circle !== undefined) {
      if (Array.isArray(opt.circle)) this._circle_config = opt.circle;
      else this._circle_config = [opt.circle, opt.circle];
    }

    if (opt.title !== undefined)
      this.draw_titles(opt.title, full_width, full_height);

    if (opt.label !== undefined)
      this.draw_labels(opt.label, { width, height, margin });

    if (opt.legend !== undefined)
      draw_legend(
        this._g,
        opt.legend.legends,
        opt.legend.config,
        opt.legend.rect_config,
        opt.legend.legend_config
      );

    return this;
  }

  public data(
    data: readonly Data[][],
    data2: readonly Data[][]
  ): d3.Selection<SVGSVGElement, undefined, null, undefined> {
    if (this._focus === undefined) this._x.data(data, (d: Data) => d.date);
    else this._x.scale.domain(this._focus);
    this._y.data(data, (d: Data) => d.value);
    this._y2.data(data2, (d: Data) => d.value);

    this.data_axis();

    this.draw_lines(
      `.${default_classes.line_area}`,
      data,
      this._line,
      this._line_config[0]
    );

    this.draw_lines(
      `.${default_classes.line_area_right}`,
      data2,
      this._line2,
      this._line_config[1]
    );

    if (this._circle_config !== undefined) {
      this.draw_circles(
        `.${default_classes.circle_area}`,
        data,
        d => this._x.scale(d.date),
        d => this._y.scale(d.value),
        this._circle_config[0]
      );

      this.draw_circles(
        `.${default_classes.circle_area_right}`,
        data2,
        d => this._x.scale(d.date),
        d => this._y2.scale(d.value),
        this._circle_config[1]
      );
    }

    return this._svg;
  }

  private draw_lines(
    class_area: string,
    data: readonly Data[][],
    line: d3.Line<Data>,
    config: ElementConfig<d3.BaseType, Data[]>
  ): void {
    draw_lines(this._g.select(class_area), data, line, config);
  }

  private draw_circles(
    class_area: string,
    data: readonly Data[][],
    x: (d: Data) => number,
    y: (d: Data) => number,
    config: CircleConfig
  ): void {
    draw_circles(
      this._g.select(class_area),
      data,
      x,
      y,
      config.group,
      select => {
        element_config(select, config.circle);
        this._tooltip.data<Data, SVGGElement | d3.BaseType>(select);
      }
    );
  }

  private draw_titles(
    titles: Partial<Record<TitlePosition, TitleConfig>>,
    width: number,
    height: number
  ): void {
    this._svg.selectAll(`text.${default_classes.title}`).remove();

    Object.entries(titles).forEach(([pos, config]) => {
      title(
        this._svg,
        `${config.text}`,
        pos as TitlePosition,
        width,
        height,
        config.config
      );
    });
  }

  private draw_labels(labels: AxisLabelConfig[], dim: Dimension): void {
    const c: Partial<Record<AxisPosition, Axis<number> | Axis<Date>>> = {
      left: this._axis.y,
      right: this._axis.y2,
      bottom: this._axis.x,
    };

    this._svg.selectAll(`text.${default_classes.axis_label}`).remove();

    labels.forEach(o => {
      const axis = c[o.axis];
      if (axis === undefined) throw new Error(`Invalid axis [${o.axis}]`);

      axis.label(o.label, dim, o.config);
    });
  }

  private draw_axis(axis: AxisConfig, width: number, height: number): void {
    Object.keys(axis).forEach(ax => {
      switch (ax) {
        case 'x':
          if (this._axis.x === undefined)
            this._axis.x = new Axis<Date>(this._g.node() as SVGGElement);
          this._axis.x.draw('bottom', width, height);
          break;
        case 'x2':
          if (this._axis.x2 === undefined)
            this._axis.x2 = new Axis<Date>(this._g.node() as SVGGElement);
          this._axis.x2.draw('top', width, height);
          break;
        case 'y':
          if (this._axis.y === undefined)
            this._axis.y = new Axis<number>(this._g.node() as SVGGElement);
          this._axis.y.draw('left', width, height);
          break;
        case 'y2':
          if (this._axis.y2 === undefined)
            this._axis.y2 = new Axis<number>(this._g.node() as SVGGElement);
          this._axis.y2.draw('right', width, height);
          break;
      }
    });
  }

  private data_axis(): void {
    Object.entries(this._axis).forEach(([key, axis]) => {
      switch (key) {
        case 'x':
        case 'x2':
          (axis as Axis<Date>).data(this._x.scale);
          break;
        case 'y':
          (axis as Axis<number>).data(this._y.scale);
          break;
        case 'y2':
          (axis as Axis<number>).data(this._y2.scale);
          break;
      }
    });
  }
}
