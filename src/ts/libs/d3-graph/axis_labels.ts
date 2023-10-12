import type { Selection, BaseType } from 'd3';
import { element_config, type ElementConfig } from './attributes';
import type {
  LabelPosition,
  AxisPosition,
  LabelPlace,
  Dimension,
} from './types';

type Select<T> = Selection<T & BaseType, unknown, null, undefined>;

export type LabelCallFunction = (
  sel: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
) => Select<SVGTextElement>;

type LabelFunction = Record<
  AxisPosition,
  Record<LabelPlace, Record<LabelPosition, LabelCallFunction | undefined>>
>;

export const label_config: LabelFunction = {
  left: {
    outside: {
      start: label_left_start_outside,
      middle: label_left_middle_outside,
      end: label_left_end_outside,
    },
    inside: {
      start: label_left_start_inside,
      middle: label_left_middle_inside,
      end: label_left_end_inside,
    },
    top: {
      start: label_left_top,
      middle: label_left_top,
      end: label_left_top,
    },
  },
  right: {
    outside: {
      start: label_right_start_outside,
      middle: label_right_middle_outside,
      end: label_right_end_outside,
    },
    inside: {
      start: label_right_start_inside,
      middle: label_right_middle_inside,
      end: label_right_end_inside,
    },
    top: {
      start: label_right_top,
      middle: label_right_top,
      end: label_right_top,
    },
  },
  bottom: {
    outside: {
      start: label_bottom_start,
      middle: label_bottom_middle,
      end: label_bottom_end,
    },
    inside: {
      start: undefined,
      middle: undefined,
      end: undefined,
    },
    top: {
      start: undefined,
      middle: undefined,
      end: undefined,
    },
  },
  top: {
    outside: {
      start: undefined,
      middle: undefined,
      end: undefined,
    },
    inside: {
      start: undefined,
      middle: undefined,
      end: undefined,
    },
    top: {
      start: undefined,
      middle: undefined,
      end: undefined,
    },
  },
} as const;

export function call_label(
  g: Select<SVGGElement>,
  label: string,
  val: {
    axis: AxisPosition;
    position: LabelPosition;
    place: LabelPlace;
    dim: Dimension;
  },
  config: ElementConfig
): Select<SVGTextElement> {
  const func = label_config[val.axis][val.place][val.position];
  if (func === undefined) throw new Error('Invalid label config');
  return func(g, label, val.dim, config);
}

export function label_left_top(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .style('text-anchor', 'start')
    .attr('fill', 'black')
    .call(element_config, config)
    .html(label);
}

export function label_right_top(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .style('text-anchor', 'end')
    .attr('fill', 'black')
    .call(element_config, config)
    .html(label);
}

export function label_left_start_outside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height}) rotate(-90)`)
    .attr('dy', -dim.margin.left)
    .attr('fill', 'black')
    .style('text-anchor', 'start')
    .style('alignment-baseline', 'hanging')
    .call(element_config, config)
    .html(label);
}

export function label_left_start_inside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height}) rotate(90)`)
    .style('text-anchor', 'end')
    .attr('fill', 'black')
    .attr('dy', -2)
    .call(element_config, config)
    .html(label);
}

export function label_left_middle_outside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height / 2}) rotate(-90)`)
    .attr('dy', -dim.margin.left)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'hanging')
    .call(element_config, config)
    .html(label);
}

export function label_left_middle_inside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height / 2}) rotate(90)`)
    .attr('dy', -2)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .call(element_config, config)
    .html(label);
}

export function label_left_end_outside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dy', -dim.margin.left)
    .attr('fill', 'black')
    .style('text-anchor', 'end')
    .style('alignment-baseline', 'hanging')
    .call(element_config, config)
    .html(label);
}

export function label_left_end_inside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', 'rotate(90)')
    .attr('dy', -2)
    .attr('fill', 'black')
    .style('text-anchor', 'start')
    .call(element_config, config)
    .html(label);
}

export function label_bottom_middle(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(${dim.width / 2}, 0)`)
    .attr('dy', dim.margin.bottom)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .call(element_config, config)
    .html(label);
}

export function label_bottom_end(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(${dim.width}, 0)`)
    .attr('dy', dim.margin.bottom)
    .attr('fill', 'black')
    .style('text-anchor', 'end')
    .call(element_config, config)
    .html(label);
}

export function label_bottom_start(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('dy', dim.margin.bottom)
    .attr('fill', 'black')
    .style('text-anchor', 'start')
    .call(element_config, config)
    .html(label);
}

export function label_right_start_outside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height}) rotate(90)`)
    .attr('dy', -dim.margin.right)
    .attr('fill', 'black')
    .style('text-anchor', 'end')
    .style('alignment-baseline', 'hanging')
    .call(element_config, config)
    .html(label);
}

export function label_right_start_inside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height}) rotate(-90)`)
    .attr('dy', -2)
    .attr('fill', 'black')
    .style('text-anchor', 'start')
    .call(element_config, config)
    .html(label);
}

export function label_right_middle_outside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height / 2}) rotate(90)`)
    .attr('dy', -dim.margin.right)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'hanging')
    .call(element_config, config)
    .html(label);
}

export function label_right_middle_inside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `translate(0, ${dim.height / 2}) rotate(-90)`)
    .attr('dy', -2)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .call(element_config, config)
    .html(label);
}

export function label_right_end_outside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', 'rotate(90)')
    .attr('dy', -dim.margin.right)
    .attr('fill', 'black')
    .style('text-anchor', 'start')
    .style('alignment-baseline', 'hanging')
    .call(element_config, config)
    .html(label);
}

export function label_right_end_inside(
  g: Select<SVGGElement>,
  label: string,
  dim: Dimension,
  config: ElementConfig
): Select<SVGTextElement> {
  return g
    .append('text')
    .attr('transform', `rotate(-90)`)
    .attr('dy', -2)
    .attr('fill', 'black')
    .style('text-anchor', 'end')
    .call(element_config, config)
    .html(label);
}
