import type { ElementConfig } from './attributes';
import { draw_label } from './axis_labels';
import * as d3 from 'd3';
import type {
  LabelPosition,
  LabelPlace,
  AxisPosition,
  Dimension,
} from './types';

export interface LabelConfig extends ElementConfig {
  position?: LabelPosition;
  place?: LabelPlace;
}

export class Axis<Domain extends d3.AxisDomain> {
  private readonly _axis: d3.Selection<SVGGElement, unknown, null, undefined>;
  private _draw_axis?: (scale: d3.AxisScale<Domain>) => d3.Axis<Domain>;

  constructor(el: SVGElement) {
    this._axis = d3.select(el).append('g');
  }

  get element(): d3.Selection<SVGGElement, unknown, null, undefined> {
    return this._axis;
  }

  public draw(pos: AxisPosition, width: number, height: number): void {
    switch (pos) {
      case 'right':
        this._axis.attr('transform', `translate(${width},0)`);
        this._draw_axis = d3.axisRight;
        break;
      case 'bottom':
        this._axis.attr('transform', `translate(0,${height})`);
        this._draw_axis = d3.axisBottom;
        break;
      case 'top':
        this._draw_axis = d3.axisTop;
        break;
      case 'left':
        this._draw_axis = d3.axisLeft;
        break;
    }
  }

  public label(
    label: string,
    dim: Dimension,
    {
      position = 'middle',
      place = 'outside',
      attr = {},
      style = {},
      transition = {},
    }: LabelConfig = {}
  ): d3.Selection<SVGTextElement, unknown, null, undefined> {
    return draw_label(
      this._axis,
      label,
      {
        position,
        place,
        axis: this.get_axis(),
        dim,
      },
      { attr, style, transition }
    );
  }

  public data(scale: d3.AxisScale<Domain>): void {
    if (this._draw_axis !== undefined) this._axis.call(this._draw_axis(scale));
  }

  private get_axis(): AxisPosition {
    switch (this._draw_axis) {
      case d3.axisBottom:
        return 'bottom';
      case d3.axisTop:
        return 'top';
      case d3.axisLeft:
        return 'left';
      case d3.axisRight:
        return 'right';
    }
    throw new Error('Invalid axis');
  }
}
