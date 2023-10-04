import * as d3 from 'd3';
import type {
  Accessor,
  // CircleStyle, LineStyle
} from './types';

export function calculate_multi_domain<D, T extends d3.Numeric>(
  data: D[][],
  accessor: Accessor<T, D>
): [T, T] {
  const dd = data.reduce<T[]>((acc, d) => {
    acc.push(...(d3.extent<D, T>(d, accessor) as [T, T]));
    return acc;
  }, []);
  return d3.extent(dd) as [T, T];
}

/**
 * Not tested
 */
// export function style_circle<T = any>(
//   selection: d3.Selection<d3.BaseType, T, SVGGElement, undefined>,
//   style: CircleStyle
// ): d3.Selection<d3.BaseType, T, SVGGElement, undefined> {
//   Object.entries(style).forEach(([name, value]) => selection.attr(name, value));
//   return selection;
// }

// export function style_line<T = unknown>(
//   selection: d3.Selection<
//     d3.BaseType | SVGPathElement,
//     T,
//     SVGGElement,
//     undefined
//   >,
//   style: LineStyle
// ):
//   | d3.Selection<d3.BaseType | SVGPathElement, T, SVGGElement, undefined>
//   | d3.Transition<d3.BaseType | SVGPathElement, T, d3.BaseType, undefined> {
//   Object.entries(style).forEach(([name, value]) =>
//     selection.style(name, value)
//   );
//   selection.style('fill', 'none');
//   return selection;
// }
