type AttributeValue = string | number | boolean | null;
type StyleValue = string | number | boolean;
type ConfigFunction<T> = (d: unknown, i: number) => T;
type Arguments<T> = T | readonly T[] | ConfigFunction<T>;
type AttributeList = Record<string, Arguments<AttributeValue>>;
export type StyleList = Record<string, Arguments<StyleValue>>;
type TransitionAttributeList = Record<string, AttributeValue>;
type TransitionStyleList = Record<string, StyleValue>;

interface TransitionConfig {
  duration?: number;
  delay?: number;
  attr?: TransitionAttributeList;
  style?: TransitionStyleList;
}

export interface ElementConfig {
  attr?: AttributeList;
  style?: StyleList;
  transition?: TransitionConfig;
}

function exec_value<T>(value: Arguments<T>): T | ConfigFunction<T> {
  return value instanceof Array ? (d, i) => value[i] : value;
}

function set_attribute<S, T, P, PD>(
  select: d3.Selection<S & d3.BaseType, T, P & d3.BaseType, PD>,
  attrs: AttributeList
): d3.Selection<S & d3.BaseType, T, P & d3.BaseType, PD> {
  Object.entries(attrs).forEach(([attr, value]) => {
    select.attr(attr, exec_value(value));
  });
  return select;
}

function transition_set_attribute<S, T, P, PD>(
  select: d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD>,
  attrs: TransitionAttributeList
): d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD> {
  Object.entries(attrs).forEach(([attr, value]) => {
    select.attr(attr, value);
  });
  return select;
}

function set_style<S, T, P, PD>(
  select: d3.Selection<S & d3.BaseType, T, P & d3.BaseType, PD>,
  styles: StyleList
): d3.Selection<S & d3.BaseType, T, P & d3.BaseType, PD> {
  Object.entries(styles).forEach(([style, value]) => {
    select.style(style, exec_value(value) as StyleValue);
  });
  return select;
}

function transition_set_style<S, T, P, PD>(
  select: d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD>,
  styles: TransitionStyleList
): d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD> {
  Object.entries(styles).forEach(([style, value]) => {
    select.style(style, value);
  });
  return select;
}

function transition_config<S, T, P, PD>(
  select: d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD>,
  config: TransitionConfig
): d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD> {
  if (config.duration !== undefined) select.duration(config.duration);
  if (config.delay !== undefined) select.duration(config.delay);
  if (config.attr !== undefined) transition_set_attribute(select, config.attr);
  if (config.style !== undefined) transition_set_style(select, config.style);

  return select;
}

export function element_config<S, T, P, PD>(
  select: d3.Selection<S & d3.BaseType, T, P & d3.BaseType, PD>,
  config: ElementConfig
):
  | d3.Selection<S & d3.BaseType, T, P & d3.BaseType, PD>
  | d3.Transition<S & d3.BaseType, T, P & d3.BaseType, PD> {
  if (config.attr !== undefined) set_attribute(select, config.attr);
  if (config.style !== undefined) set_style(select, config.style);
  if (config.transition !== undefined)
    return transition_config(select.transition(), config.transition);
  return select;
}
