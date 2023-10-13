import type { Selection, BaseType } from 'd3';
import { type ElementConfig, element_config } from './attributes';
import { add_class_config } from './helper';

type Select<T> = Selection<T & BaseType, undefined, null, undefined>;

export type TitlePosition = 'top' | 'bottom';

function title_top(
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

function title_bottom(
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

export function title(
  g: Select<SVGSVGElement>,
  title: string,
  position: TitlePosition,
  width: number,
  height: number,
  config: ElementConfig
): Select<SVGTextElement> {
  add_class_config('--graph-title', config);
  if (position === 'top') return title_top(g, title, width, config);
  return title_bottom(g, title, width, height, config);
}
