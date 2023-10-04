import * as d3 from 'd3';

export interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface LineDefinition {
  line: d3.CurveFactory | d3.CurveBundleFactory;
  is_close: boolean;
}

// https://github.com/d3/d3-shape#curves
export const curves: Record<string, LineDefinition> = {
  basis: { line: d3.curveBasis, is_close: false },
  basis_closed: { line: d3.curveBasisClosed, is_close: true },
  basis_open: { line: d3.curveBasisOpen, is_close: false },
  bumpX: { line: d3.curveBumpX, is_close: false },
  bumpY: { line: d3.curveBumpY, is_close: false },
  bundle: { line: d3.curveBundle, is_close: false },
  cardinal: { line: d3.curveCardinal, is_close: false },
  cardinal_closed: { line: d3.curveCardinalClosed, is_close: true },
  cardinal_open: { line: d3.curveCardinalOpen, is_close: false },
  catmin_rom: { line: d3.curveCatmullRom, is_close: false },
  catmin_rom_closed: { line: d3.curveCatmullRomClosed, is_close: true },
  catmin_rom_open: { line: d3.curveCatmullRomOpen, is_close: false },
  linear: { line: d3.curveLinear, is_close: false },
  liner_closed: { line: d3.curveLinearClosed, is_close: true },
  monotoneX: { line: d3.curveMonotoneX, is_close: false },
  mononoteY: { line: d3.curveMonotoneY, is_close: false },
  natural: { line: d3.curveNatural, is_close: false },
  step: { line: d3.curveStep, is_close: false },
  step_afeter: { line: d3.curveStepAfter, is_close: false },
  step_before: { line: d3.curveStepBefore, is_close: false },
};

export type Accessor<T, D = any> = (d: D, i: number) => T;
export type AttributeValue<T, D = any> = T | readonly T[] | Accessor<T, D>;

export function value_to_function<T>(t: AttributeValue<T>): Accessor<T> | T {
  if (typeof t === 'function') return t as Accessor<T>;
  if (Array.isArray(t)) return (d, i) => t[i];
  return t as T;
}

export function attribute_to_value<T>(t: AttributeValue<T>, index: number): T {
  // if (typeof t === 'function') return t(d, index);
  if (Array.isArray(t)) return t[index];
  return t as T;
}

export interface CircleStyle {
  r?: AttributeValue<number>;
  'stroke-width'?: AttributeValue<number>; // eslint-disable-line @typescript-eslint/naming-convention
  stroke?: AttributeValue<string>;
  fill?: AttributeValue<string>;
}

export interface LineStyle {
  stroke?: AttributeValue<string>;
  'stroke-width'?: AttributeValue<number>; // eslint-disable-line @typescript-eslint/naming-convention
}
