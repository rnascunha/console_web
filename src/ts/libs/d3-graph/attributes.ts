import type { BaseType, Selection, Transition, ValueFn } from 'd3';

type AttributeValue = string | number | boolean | null;
type StyleValue = string | number | boolean;
type Arguments<T extends BaseType, D, R> = R | readonly R[] | ValueFn<T, D, R>;
type AttributeList<T extends BaseType, D> = Record<
  string,
  Arguments<T, D, AttributeValue>
>;
type StyleList<T extends BaseType, D> = Record<
  string,
  Arguments<T, D, StyleValue>
>;

interface BaseElementConfig<T extends BaseType, D> {
  attr?: AttributeList<T, D>;
  style?: StyleList<T, D>;
  text?: string | ValueFn<T, D, string>;
}

interface TransitionConfig<T extends BaseType, D>
  extends BaseElementConfig<T, D> {
  duration?: number;
  delay?: number;
}

export interface ElementConfig<T extends BaseType = BaseType, D = undefined>
  extends BaseElementConfig<T, D> {
  class?: string[];
  html?: string | ValueFn<T, D, string>;
  transition?: TransitionConfig<T, D>;
}

function exec_value<T extends BaseType, D, R>(
  value: Arguments<T, D, R>
): R | ValueFn<T, D, R> {
  return value instanceof Array ? (d, i) => value[i] : value;
}

function set_attribute<T extends BaseType, D, P extends BaseType, PD>(
  select: Selection<T, D, P, PD> | Transition<T, D, P, PD>,
  attrs: AttributeList<T, D>
): Selection<T, D, P, PD> | Transition<T, D, P, PD> {
  Object.entries(attrs).forEach(([attr, value]) => {
    select.attr(attr, exec_value(value) as AttributeValue);
  });
  return select;
}

function set_style<T extends BaseType, D, P extends BaseType, PD>(
  select: Selection<T, D, P, PD> | Transition<T, D, P, PD>,
  styles: StyleList<T, D>
): Selection<T, D, P, PD> | Transition<T, D, P, PD> {
  Object.entries(styles).forEach(([style, value]) => {
    select.style(style, exec_value(value) as StyleValue);
  });
  return select;
}

function set_class<T extends BaseType, D, P extends BaseType, PD>(
  select: Selection<T, D, P, PD>,
  classes: string[]
): Selection<T, D, P, PD> {
  classes.forEach(c => {
    select.classed(c, true);
  });
  return select;
}

function base_config<T extends BaseType, D, P extends BaseType, PD>(
  select: Selection<T, D, P, PD> | Transition<T, D, P, PD>,
  config: BaseElementConfig<T, D>
): Selection<T, D, P, PD> | Transition<T, D, P, PD> {
  if (config.attr !== undefined) set_attribute(select, config.attr);
  if (config.style !== undefined) set_style(select, config.style);
  if (config.text !== undefined) select.text(exec_value(config.text) as string);

  return select;
}

function transition_config<T extends BaseType, D, P extends BaseType, PD>(
  select: Transition<T, D, P, PD>,
  config: TransitionConfig<T, D>
): Transition<T, D, P, PD> {
  base_config(select, config);
  if (config.duration !== undefined) select.duration(config.duration);
  if (config.delay !== undefined) select.duration(config.delay);

  return select;
}

export function element_config<
  T extends BaseType = BaseType,
  D = undefined,
  P extends BaseType = null,
  PD = undefined
>(
  select: Selection<T, D, P, PD>,
  config: ElementConfig<T, D>
): Selection<T, D, P, PD> | Transition<T, D, P, PD> {
  base_config(select, config);
  if (config.class !== undefined) set_class(select, config.class);
  if (config.html !== undefined) select.html(exec_value(config.html));
  if (config.transition !== undefined)
    return transition_config(select.transition(), config.transition);
  return select;
}
