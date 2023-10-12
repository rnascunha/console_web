import type { Selection, BaseType } from 'd3';
import { type ElementConfig, element_config } from './attributes';

type Select<T> = Selection<T & BaseType, undefined, null, undefined>;

export function title_top(
  g: Select<SVGSVGElement>,
  title: string,
  width: number,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(${width / 2},0)`)
    .style('alignment-baseline', 'hanging')
    .style('text-anchor', 'middle')
    .call(element_config, config)
    .html(title);
}

export function title_bottom(
  g: Select<SVGSVGElement>,
  title: string,
  width: number,
  height: number,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(${width / 2}, ${height})`)
    .style('text-anchor', 'middle')
    .call(element_config, config)
    .html(title);
}
