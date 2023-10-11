import * as d3 from 'd3';
import { element_config, type StyleList } from './attributes';

export type CallTooltip = (ev: MouseEvent, d: unknown) => string;

export class Tooltip {
  private readonly _tooltips: d3.Selection<HTMLDivElement, unknown, null, any>;
  private readonly _call: CallTooltip;

  constructor(container: HTMLElement, call: CallTooltip) {
    this._tooltips = d3
      .select(container)
      .append('div')
      .call(element_config, {
        style: {
          opacity: 0,
          position: 'absolute',
          top: 0,
          'pointer-events': 'none',
          'z-index': 100,
          'background-color': 'white',
          border: '1px solid black',
          'border-radius': '3px',
          padding: '2px',
        },
      });

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

const default_style: StyleList = {
  'background-color': 'white',
  border: '1px solid black',
  'border-radius': '3px',
  padding: '2px',
};

export class Tooltip2 {
  private readonly _tooltips: d3.Selection<
    HTMLDivElement,
    undefined,
    null,
    undefined
  >;

  private readonly _call: CallTooltip;

  constructor(call: CallTooltip) {
    this._tooltips = d3.create('div').call(element_config, {
      style: {
        opacity: 0,
        position: 'absolute',
        top: 0,
        'pointer-events': 'none',
        'z-index': 100,
        ...default_style,
      },
    });

    this._call = call;
  }

  public draw(container: HTMLElement, style: StyleList = {}): void {
    container.appendChild(this._tooltips.node() as HTMLElement);
    this._tooltips.call(element_config, {
      style,
    });
  }

  public data<T, P>(
    select: d3.Selection<SVGCircleElement, T, P & d3.BaseType, T[]>
  ): void {
    select.on('mouseover', (ev, d) => {
      console.log('ev', ev, d);
      this._tooltips
        .call(element_config, {
          style: {
            opacity: 1,
            left: `${(ev as MouseEvent).offsetX}px`,
            top: `${(ev as MouseEvent).offsetY}px`,
          },
        })
        .text(this._call(ev, d));
    });
    select.on('mouseout', (ev, d) => {
      this._tooltips.style('opacity', 0);
    });
  }
}
