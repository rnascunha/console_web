import { type ElementConfig, element_config } from './attributes';

export type Callable<Base, T, P = undefined> = (
  select: d3.Selection<Base & d3.BaseType, T, SVGGElement | d3.BaseType, P>,
  ...args: any
) => void;

export function draw_lines<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  line: d3.Line<T>,
  config: ElementConfig
): void {
  select
    .selectAll('path')
    .data(data)
    .join(enter => enter.append('path'))
    .attr('fill', 'none')
    .call(element_config, config)
    .transition()
    .attr('d', line);
}

export function draw_circles<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  x: (d: T) => number,
  y: (d: T) => number,
  config_g: ElementConfig,
  on_enter: Callable<SVGCircleElement, T, T[]>
): void {
  select
    .selectAll('g.--dot')
    .data(data)
    .join(enter => enter.append('g').classed('--dot', true))
    .call(element_config, { attr: config_g.attr })
    .selectAll('circle')
    .data(d => d)
    .join(
      enter =>
        enter.append('circle').attr('cx', x).attr('cy', y).call(on_enter),
      update => update.transition().attr('cx', x).attr('cy', y)
    );
}

export function draw_circles2<T>(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: readonly T[][],
  x: (d: T) => number,
  y: (d: T) => number,
  config_g: ElementConfig,
  on_enter: Callable<SVGCircleElement, T, T[]>
): void {
  select
    .selectAll('g.--dot')
    .data(data)
    .join(enter => enter.append('g').classed('--dot', true))
    .call(element_config, { attr: config_g.attr })
    .selectAll('circle')
    .data(d => d)
    .join(enter => enter.append('circle').call(on_enter))
    .attr('cx', x)
    .attr('cy', y);
}
