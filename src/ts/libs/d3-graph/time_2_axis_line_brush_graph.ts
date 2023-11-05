import { BrushX } from './brush';
import { get_dimensions } from './helper';
import {
  Time2AxisLineGraph,
  type Data,
  type Time2AxisLineGraphOptions,
} from './time_2_axis_line_graph';

export interface Time2AxisLineBrushGraphOptions
  extends Time2AxisLineGraphOptions {
  brush_height: number;
  order?: number;
  brush_options?: Time2AxisLineGraphOptions;
}

const template = function (height: number, order: number): HTMLTemplateElement {
  const t = document.createElement('template');
  t.innerHTML = `
    <style>
      .--graph {
        flex-grow: 1;
        width: 100%;
        height: calc(100% - ${height}px);
      }

      .--brush {
        height: ${height}px;
        order: ${order};
        width: 100%;
      }
    </style>
    <div class=--graph></div>
    <div class=--brush></div>`;

  return t;
};

export class Time2AxisLineBrushGraph {
  private readonly _graph: Time2AxisLineGraph;
  private readonly _graph_brush: Time2AxisLineGraph;

  private readonly _brush: BrushX;

  private _data: [readonly Data[][], readonly Data[][]] = [[], []];

  constructor() {
    this._graph = new Time2AxisLineGraph();
    this._graph_brush = new Time2AxisLineGraph();

    this._brush = new BrushX();
    this._brush.on('brush', () => {
      this._graph.focus(this._brush.focus(this._graph_brush.x));
      this.data(this._data[0], this._data[1]);
    });
  }

  get graph(): Time2AxisLineGraph {
    return this._graph;
  }

  get graph_brush(): Time2AxisLineGraph {
    return this._graph_brush;
  }

  get brush(): BrushX {
    return this._brush;
  }

  public draw(
    container: HTMLElement,
    opt: Time2AxisLineBrushGraphOptions
  ): this {
    const [elg, elb] = this.create_container(container, opt);
    const brush_opt = opt.brush_options ?? create_brush_options(opt);

    elg.appendChild(this._graph.draw(elg, opt).node.node() as SVGSVGElement);
    elb.appendChild(
      this._graph_brush.draw(elb, brush_opt).node.node() as SVGSVGElement
    );

    const { width, height } = get_dimensions(elb, brush_opt.margin);
    this._brush.draw(this._graph_brush.group, width, height);

    return this;
  }

  public data(data: readonly Data[][], data2: readonly Data[][]): this {
    this._data[0] = data;
    this._data[1] = data2;

    this._graph.data(data, data2);
    this._graph_brush.data(data, data2);

    this._brush.set_focus(
      this._graph_brush.group,
      domain_to_range(this._graph_brush, this._graph.get_focus())
    );

    return this;
  }

  private create_container(
    container: HTMLElement,
    opt: Time2AxisLineBrushGraphOptions
  ): [HTMLElement, HTMLElement] {
    if (container.querySelector('.--graph') === null) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.appendChild(
        template(opt.brush_height, opt.order ?? 0).content.cloneNode(true)
      );
    }

    return [
      container.querySelector('.--graph') as HTMLElement,
      container.querySelector('.--brush') as HTMLElement,
    ];
  }
}

function domain_to_range(
  graph: Time2AxisLineGraph,
  focus: [Date, Date] | null
): [number, number] | null {
  const x = graph.x.scale;
  if (focus === null) return null;
  return [x(focus[0]), x(focus[1])];
}

function create_brush_options(
  opt: Time2AxisLineGraphOptions
): Time2AxisLineGraphOptions {
  const nopt: Time2AxisLineGraphOptions = {
    config: opt.config,
    margin: {
      bottom: 20,
      top: 0,
      left: opt.margin.left,
      right: opt.margin.right,
    },
    line: opt.line,
    axis: {
      x: true,
    },
  };

  return nopt;
}
