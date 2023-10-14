import type * as d3 from 'd3';
import { type ElementConfig, element_config } from './attributes';
import { default_classes } from './types';

export interface LegendConfig {
  x: number;
  y: number;
  side: number;
  dy: number;
}

export function draw_legend(
  g: d3.Selection<SVGGElement, undefined, null, undefined>,
  legends: string[],
  lconfig: LegendConfig,
  rect_config: ElementConfig,
  legend_config: ElementConfig
): d3.Selection<SVGGElement, undefined, null, undefined> {
  const l = g
    .selectAll(`.${default_classes.legend}`)
    .data([legends])
    .enter()
    .append('g')
    .classed(default_classes.legend, true)
    .attr('transform', `translate(${lconfig.x}, ${lconfig.y})`)
    .selectAll('g')
    .data(legends, d => d as string)
    .join('g');

  l.append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * lconfig.dy)
    .attr('width', lconfig.side)
    .attr('height', lconfig.side)
    .call(element_config, rect_config);

  l.append('text')
    .attr('x', lconfig.side + 4)
    .attr('y', (d, i) => i * lconfig.dy)
    .attr('alignment-baseline', 'hanging')
    .html(d => d)
    .call(element_config, legend_config);

  return g;
}
