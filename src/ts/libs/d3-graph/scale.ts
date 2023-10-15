import type { Accessor } from './types';
import {
  type ScaleLinear as D3ScaleLinear,
  type ScaleTime as D3ScaleTime,
  scaleTime,
  scaleLinear,
} from 'd3';

type RangeType = [number, number];
type DomainType<D> = (d: readonly any[], accessor: Accessor<D, any>) => [D, D];

interface ScaleType<D> {
  range: (d: [number, number]) => any;
  domain: (d: Iterable<D>) => any;
  nice: (ticks?: number) => any;
}

interface ScaleOptions {
  nice?: boolean;
}

const default_scale_options = {
  nice: true,
};

export class Scale<D, T extends ScaleType<D>> {
  private readonly _scale: T;
  private readonly _domain: DomainType<D>;
  private readonly _opt: ScaleOptions;

  constructor(scale: T, domain: DomainType<D>, opt: ScaleOptions = {}) {
    this._scale = scale;
    this._domain = domain;
    this._opt = { ...default_scale_options, ...opt };
  }

  public get scale(): T {
    return this._scale;
  }

  public draw(range: RangeType): void {
    this._scale.range(range);
  }

  public data(d: readonly unknown[], accessor: Accessor<D, any>): void {
    this._scale.domain(this._domain(d, accessor));
    if (this._opt.nice === true) this._scale.nice();
  }
}

export class ScaleTime extends Scale<Date, D3ScaleTime<number, number, never>> {
  constructor(domain: DomainType<Date>, opt: ScaleOptions = {}) {
    super(scaleTime(), domain, opt);
  }
}

export class ScaleLinear extends Scale<
  number,
  D3ScaleLinear<number, number, never>
> {
  constructor(domain: DomainType<number>, opt: ScaleOptions = {}) {
    super(scaleLinear(), domain, opt);
  }
}