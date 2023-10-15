import { type BaseType, type Numeric, extent } from 'd3';
import type { Accessor, Dimension, Margin } from './types';
import type { ElementConfig } from './attributes';

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
