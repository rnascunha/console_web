import { type Selection, type ZoomBehavior, zoom as d3Zoom } from 'd3';
import type { Dimension } from './types';

export function zoom(
  select: Selection<SVGSVGElement, undefined, null, undefined>,
  group: Selection<SVGGElement, undefined, null, undefined>,
  dim: Dimension
): ZoomBehavior<SVGSVGElement, undefined> {
  const zm: ZoomBehavior<SVGSVGElement, undefined> = d3Zoom();

  zm.on('zoom', ev => {
    group.attr('transform', ev.transform);
  });

  select.call(zm);

  select.on('auxclick', ev => {
    select.call(zm.scaleTo, 1);
    select
      .transition()
      .call(
        zm.translateTo,
        0.5 * dim.width,
        0.5 * dim.height + dim.margin.top / 2
      );
  });

  return zm;
}
