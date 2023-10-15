import { type Selection, type BaseType, create } from 'd3';
import { element_config, type ElementConfig } from './attributes';

export type CallTooltip = (ev: MouseEvent, d: unknown) => string;

const default_style = {
  'background-color': 'white',
  border: '1px solid black',
  'border-radius': '3px',
  padding: '2px',
};

export class Tooltip {
  private readonly _tooltips: Selection<
    HTMLDivElement,
    undefined,
    null,
    undefined
  >;

  private _call?: CallTooltip;

  constructor() {
    this._tooltips = create('div').call(element_config, {
      style: {
        opacity: 0,
        position: 'absolute',
        top: 0,
        'pointer-events': 'none',
        'z-index': 100,
        ...default_style,
      },
    });
  }

  public draw(
    container: HTMLElement,
    call: CallTooltip,
    config: ElementConfig<HTMLDivElement> = {}
  ): void {
    this._call = call;
    container.appendChild(this._tooltips.node() as HTMLElement);
    this._tooltips.call(element_config, config);
  }

  public data<T, P>(
    select: Selection<SVGCircleElement, T, P & BaseType, T[]>
  ): void {
    select.on('mouseover', (ev, d) => {
      this._tooltips
        .call(element_config, {
          style: {
            opacity: 1,
            left: `${(ev as MouseEvent).offsetX}px`,
            top: `${(ev as MouseEvent).offsetY}px`,
          },
        })
        .html((this._call as CallTooltip)(ev, d));
    });
    select.on('mouseout', (ev, d) => {
      this._tooltips.style('opacity', 0);
    });
  }
}
