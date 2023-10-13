import * as d3 from 'd3';
import { ScaleLinear, ScaleTime } from './scale';
import { extent_multi_domain, get_dimensions } from './helper';
import { Axis, type LabelConfig } from './axis';
import { type ElementConfig, element_config } from './attributes';
import { Tooltip, type CallTooltip } from './tooltip';
import { draw_circles, draw_lines } from './shapes';
import { title, type TitlePosition } from './title';
import { type AxisPosition, type Dimension, default_classes } from './types';

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

type LineConfig = ElementConfig;

interface CircleConfig {
  group: ElementConfig;
  circle: ElementConfig;
}

interface AxisLabelConfig {
  axis: AxisPosition;
  label: string;
  config: LabelConfig;
}

interface TitleConfig {
  text: string;
  config: ElementConfig;
}

export interface Time2AxisLineGraphOptions {
  margin: Margin;
  line?: LineConfig | [LineConfig, LineConfig];
  circle?: CircleConfig | [CircleConfig, CircleConfig];
  tooltip?: {
    on: CallTooltip;
    config?: ElementConfig;
  };
  title?: Partial<Record<TitlePosition, TitleConfig>>;
  label?: AxisLabelConfig[];
}

const default_line_config = {
  attr: {
    fill: 'none',
    'stroke-width': 1.5,
    stroke: d3.schemeCategory10,
  },
};

const default_circle_config = {
  group: {
    attr: {
      fill: d3.schemeCategory10,
    },
  },
  circle: {
    attr: {
      r: 4,
    },
  },
};

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

  private readonly _x_axis: Axis<Date>;
  private readonly _y_axis: Axis<number>;
  private readonly _y2_axis: Axis<number>;

  private readonly _line: d3.Line<Data>;
  private readonly _line2: d3.Line<Data>;

  private readonly _tooltip: Tooltip;

  private _line_config: [ElementConfig, ElementConfig];
  private _circle_config: [CircleConfig, CircleConfig];

  constructor() {
    this._svg = d3.create('svg');
    this._g = this._svg.append('g');

    this._x = new ScaleTime(extent_multi_domain<Data, Date>);
    this._y = new ScaleLinear(extent_multi_domain<Data, number>);
    this._y2 = new ScaleLinear(extent_multi_domain<Data, number>);

    this._x_axis = new Axis<Date>(this._g.node() as SVGElement);
    this._y_axis = new Axis<number>(this._g.node() as SVGElement);
    this._y2_axis = new Axis<number>(this._g.node() as SVGElement);

    this._line = d3.line<Data>();
    this._line2 = d3.line<Data>();

    this._tooltip = new Tooltip();

    this._line_config = [default_line_config, default_line_config];
    this._circle_config = [default_circle_config, default_circle_config];

    this._g.append('g').classed('--line-area', true);
    this._g.append('g').classed('--circle-area', true);

    this._g.append('g').classed('--line-area-right', true);
    this._g.append('g').classed('--circle-area-right', true);
  }

  get node(): d3.Selection<SVGSVGElement, undefined, null, undefined> {
    return this._svg;
  }

  public draw(container: HTMLElement, opt: Time2AxisLineGraphOptions): this {
    const { width, height, margin } = get_dimensions(container, opt.margin);
    const full_width = width + margin.right + margin.left;
    const full_height = height + margin.bottom + margin.top;

    this._svg.attr('width', full_width).attr('height', full_height);

    this._g.attr('transform', `translate(${margin.left}, ${margin.top})`);

    if (opt.tooltip !== undefined)
      this._tooltip.draw(container, opt.tooltip.on, opt.tooltip.config ?? {});

    this._x.draw([0, width]);
    this._y.draw([height, 0]);
    this._y2.draw([height, 0]);

    this._x_axis.draw('bottom', width, height);
    this._y_axis.draw('left', width, height);
    this._y2_axis.draw('right', width, height);

    this._line
      .curve(d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y.scale(d.value));

    if (opt.line !== undefined) {
      if (Array.isArray(opt.line)) this._line_config = opt.line;
      else this._line_config = [opt.line, opt.line];
    }

    if (opt.circle !== undefined) {
      if (Array.isArray(opt.circle)) this._circle_config = opt.circle;
      else this._circle_config = [opt.circle, opt.circle];
    }

    this._line2
      .curve(d3.curveLinear)
      .x(d => this._x.scale(d.date))
      .y(d => this._y2.scale(d.value));

    if (opt.title !== undefined)
      this.draw_titles(opt.title, full_width, full_height);

    if (opt.label !== undefined)
      this.draw_labels(opt.label, { width, height, margin });

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
    this._y2_axis.data(this._y2.scale);

    this.draw_lines('.--line-area', data, this._line, this._line_config[0]);
    this.draw_lines(
      '.--line-area-right',
      data2,
      this._line2,
      this._line_config[1]
    );

    this.draw_circles(
      '.--circle-area',
      data,
      d => this._x.scale(d.date),
      d => this._y.scale(d.value),
      this._circle_config[0]
    );

    this.draw_circles(
      '.--circle-area-right',
      data2,
      d => this._x.scale(d.date),
      d => this._y2.scale(d.value),
      this._circle_config[1]
    );

    return this._svg;
  }

  private draw_lines(
    class_area: string,
    data: readonly Data[][],
    line: d3.Line<Data>,
    config: ElementConfig
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
      left: this._y_axis,
      right: this._y2_axis,
      bottom: this._x_axis,
    };

    this._svg.selectAll(`text.${default_classes.axis_label}`).remove();

    labels.forEach(o => {
      const axis = c[o.axis];
      if (axis === undefined) throw new Error(`Invalid axis [${o.axis}]`);

      axis.label(o.label, dim, o.config);
    });
  }
}
