import { type Selection, brushX } from 'd3';
import type { Scale, ScaleType } from './scale';
import EventEmitter from '../event_emitter';

interface BrushXEvents {
  brush: BrushX;
}

export class BrushX extends EventEmitter<BrushXEvents> {
  private _focus: [number, number] | null = null;

  constructor(focus?: [number, number]) {
    super();
    if (focus !== undefined) this._focus = focus;
  }

  get range(): [number, number] | null {
    return this._focus;
  }

  public focus<D, T extends ScaleType<D>>(
    scale: Scale<D, T>
  ): [D, D] | undefined {
    if (this._focus === null) return undefined;
    return [scale.invert(this._focus[0]), scale.invert(this._focus[1])];
  }

  public draw(
    g: Selection<SVGGElement, undefined, null, undefined>,
    width: number,
    height: number
  ): void {
    const brush = brushX<undefined>().extent([
      [0, 0],
      [width, height],
    ]);

    g.call(brush).call(brush.move, this._focus);

    const brushed = ({ selection }: { selection?: [number, number] }): void => {
      if (selection !== undefined) {
        this._focus = selection;
        this.emit('brush', this);
      }
    };

    const brushended = ({
      selection,
    }: {
      selection?: [number, number];
    }): void => {
      if (selection === undefined) {
        this._focus = null;
        g.call(brush.move, [0, width]);
        this.emit('brush', this);
      }
    };

    brush.on('brush', brushed).on('end', brushended);
  }
}
