import { type BaseType, type Numeric, extent } from 'd3';
import type { Accessor, Dimension, Margin } from './types';
import type { ElementConfig } from './attributes';
import type { Scale, ScaleType } from './scale';

export function extent_multi_domain<D, T extends Numeric>(
  data: readonly D[][],
  accessor: Accessor<T, D>
): [T, T] {
  const dd = data.reduce<T[]>((acc, d) => {
    acc.push(...(extent<D, T>(d, accessor) as [T, T]));
    return acc;
  }, []);
  return extent(dd) as [T, T];
}

export function get_dimensions(
  container: HTMLElement,
  margin: Margin
): Dimension {
  const dim = getComputedStyle(container);

  const rwidth =
    container.clientWidth -
    parseInt(dim.paddingLeft) -
    parseInt(dim.paddingRight);

  const rheight =
    container.clientHeight -
    parseInt(dim.paddingTop) -
    parseInt(dim.paddingBottom);

  return {
    width: rwidth - margin.left - margin.right,
    height: rheight - margin.bottom - margin.top,
    margin,
  };
}

export function add_class_config<T extends BaseType>(
  classs: string,
  config: ElementConfig<T>
): void {
  if (config.class === undefined) config.class = [classs];
  else config.class.push(classs);
}

export function domain_to_range<D, T extends ScaleType<D>>(
  scale: Scale<D, T>,
  domain: [D, D] | null
): [number, number] | null {
  if (domain === null) return null;
  return [scale.scale(domain[0]), scale.scale(domain[1])];
}

export function range_to_domain<D, T extends ScaleType<D>>(
  scale: Scale<D, T>,
  range: [number, number] | null
): [D, D] | null {
  if (range === null) return null;
  return [scale.scale.invert(range[0]), scale.scale.invert(range[1])];
}
