import type { DateLineData } from './time_lines';
import type { LineStyle, CircleStyle, Accessor, AttributeValue } from './types';
import { attribute_to_value } from './types';

export function draw_lines(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: DateLineData[][],
  line: d3.Line<any>,
  style_line: LineStyle
): void {
  select
    .selectAll('.--line')
    .data(data)
    .join(enter => enter.append('path').classed('--line', true))
    .style('stroke-width', style_line['stroke-width'] as Accessor<number>)
    .transition()
    .attr('d', line)
    .style('fill', 'none')
    .style('stroke', style_line.stroke as Accessor<string>);
}

export function draw_circles(
  select: d3.Selection<SVGGElement, undefined, null, undefined>,
  data: DateLineData[][],
  x: (d: DateLineData) => number,
  y: (d: DateLineData) => number,
  style_circle: CircleStyle,
  call?: (
    d: d3.Selection<SVGCircleElement, DateLineData, SVGElement, undefined>
  ) => any
): void {
  for (let i = 0; i < data.length; ++i) {
    select
      .selectAll(`.--circle-${i}`)
      .data(data[i])
      .join(enter =>
        enter
          .append('circle')
          .classed(`--circle`, true)
          .classed(`--circle-${i}`, true)
          .call(call === undefined ? () => {} : call)
      )
      .attr(
        'stroke',
        attribute_to_value(style_circle.stroke as AttributeValue<string>, i)
      )
      .attr(
        'stroke-width',
        attribute_to_value(
          style_circle['stroke-width'] as AttributeValue<number>,
          i
        )
      )
      .attr(
        'fill',
        attribute_to_value(style_circle.fill as AttributeValue<string>, i)
      )
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 0)
      .transition()
      .attr(
        'r',
        attribute_to_value(style_circle.r as AttributeValue<number>, i)
      );
  }
}
