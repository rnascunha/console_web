import {
  type Selection,
  brushX,
  type BrushBehavior,
  type BrushSelection,
} from 'd3';
import type { Scale, ScaleType } from './scale';
import EventEmitter from '../event_emitter';

interface BrushXEvents {
  brush: BrushX;
}

export class BrushX extends EventEmitter<BrushXEvents> {
  private _brush?: BrushBehavior<undefined>;
  private _focus: BrushSelection | null = null;

  constructor(focus?: [number, number]) {
    super();
    if (focus !== undefined) this._focus = focus;
  }

  get range(): BrushSelection | null {
    return this._focus;
  }

  public set_focus(
    g: Selection<SVGGElement, undefined, null, undefined>,
    f: BrushSelection | null
  ): void {
    this._focus = f;
    this._brush?.move(g, f);
  }

  public focus<D, T extends ScaleType<D>>(scale: Scale<D, T>): [D, D] | null {
    if (this._focus === null) return null;
    return [
      scale.invert(this._focus[0] as number),
      scale.invert(this._focus[1] as number),
    ];
  }

  public draw(
    g: Selection<SVGGElement, undefined, null, undefined>,
    width: number,
    height: number
  ): void {
    this._brush = brushX<undefined>().extent([
      [0, 0],
      [width, height],
    ]);

    g.call(this._brush).call(this._brush.move, this._focus);

    const brushed = ({
      selection,
      mode,
    }: {
      mode?: string;
      selection?: [number, number];
    }): void => {
      if (selection !== undefined) {
        this._focus = selection;
        if (mode !== undefined) this.emit('brush', this);
      }
    };

    const brushended = ({
      selection,
      mode,
    }: {
      mode?: string;
      selection?: [number, number];
    }): void => {
      if (selection === undefined) {
        this._focus = null;
        g.call((this._brush as BrushBehavior<undefined>).move, null);
        if (mode !== undefined) this.emit('brush', this);
      }
      if (selection === null && mode === 'handle') {
        this._focus = null;
        g.call((this._brush as BrushBehavior<undefined>).move, null);
        this.emit('brush', this);
      }
    };

    this._brush.on('brush', brushed).on('end', brushended);
  }
}
