import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import * as d3 from 'd3';

interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface TimeLineGraphOptions {
  width: number;
  height: number;
  margin?: Margin;
}

function create(opt: TimeLineGraphOptions): SVGSVGElement {
  console.log('opt', opt);

  const width = opt.height;
  const height = opt.height;
  const margin = opt.margin ?? { top: 20, bottom: 20, left: 20, right: 20 };

  const svg = d3
    .create('svg')
    .attr('width', width + margin.left + margin.top)
    .attr('height', height + margin.bottom + margin.top);

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  g.append('rect')
    .attr('width', width)
    .attr('height', height)
    .style('fill', '#fff');

  return svg.node() as SVGSVGElement;
}

export class TimeLineGraphComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.container.setTitle('TimeLineGraph');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Time Line Graph';
    }

    this.rootHtmlElement.style.overflow = 'auto';
    this.rootHtmlElement.style.height = '100%';

    this.container.on('open', () => {
      setTimeout(() => {
        this.rootHtmlElement.appendChild(
          create({
            width: this.container.width - 40,
            height: this.container.height - 40,
          })
        );
      }, 0);
    });
  }
}
