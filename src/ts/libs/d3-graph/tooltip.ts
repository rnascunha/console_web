import * as d3 from 'd3';

export type CallTooltip = (ev: MouseEvent, d: unknown) => string;

export class Tooltip {
  private readonly _tooltips: d3.Selection<HTMLDivElement, unknown, null, any>;
  private readonly _call: CallTooltip;

  constructor(container: HTMLElement, call: CallTooltip) {
    this._tooltips = d3
      .select(container)
      .append('div')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid black')
      .style('border-radius', '3px')
      .style('padding', '2px')
      .style('z-index', 100)
      .style('top', 0)
      .style('pointer-events', 'none');

    this._call = call;
  }

  public install<T>(
    select: d3.Selection<SVGCircleElement, T, SVGElement, undefined>
  ): void {
    select.on('mouseover', (ev, d) => {
      this._tooltips
        .style('opacity', 1)
        .style('left', `${(ev as MouseEvent).offsetX}px`)
        .style('top', `${(ev as MouseEvent).offsetY}px`)
        .text(this._call(ev, d));
    });
    select.on('mouseout', (ev, d) => {
      this._tooltips.style('opacity', 0);
    });
  }
}
