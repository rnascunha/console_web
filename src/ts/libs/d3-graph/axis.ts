import * as d3 from 'd3';

export enum AxisPosition {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export class Axis<Domain extends d3.AxisDomain> {
  private readonly _axis: d3.Selection<SVGGElement, unknown, null, undefined>;
  private _draw_axis?: (scale: d3.AxisScale<Domain>) => d3.Axis<Domain>;

  constructor(el: SVGElement) {
    this._axis = d3.select(el).append('g');
  }

  public draw(pos: AxisPosition, width: number, height: number): void {
    switch (pos) {
      case AxisPosition.RIGHT:
        this._axis.attr('transform', `translate(${width},0)`);
        this._draw_axis = d3.axisRight;
        break;
      case AxisPosition.BOTTOM:
        this._axis.attr('transform', `translate(0,${height})`);
        this._draw_axis = d3.axisBottom;
        break;
      case AxisPosition.TOP:
        this._draw_axis = d3.axisTop;
        break;
      case AxisPosition.LEFT:
        this._draw_axis = d3.axisLeft;
        break;
    }
  }

  public data(scale: d3.AxisScale<Domain>): void {
    if (this._draw_axis !== undefined) this._axis.call(this._draw_axis(scale));
  }
}
