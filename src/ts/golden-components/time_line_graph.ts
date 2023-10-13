import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import {
  Time2AxisLineGraph,
  type Data,
  type Time2AxisLineGraphOptions,
} from '../libs/d3-graph/time_2_axis_line_graph';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    #graph {
      overflow: none;
      height: 100%;
      background-color: white;
      padding: 2px;
    }
  </style>
  <div id=graph></div>`;
  return template;
})();

export class Time2AxisLineGraphComponent extends ComponentBase {
  private readonly _graph_el: HTMLElement;
  private readonly _graph: Time2AxisLineGraph;
  private _data: [Data[][], Data[][]] = [[], []];
  private readonly _opt_graph: Time2AxisLineGraphOptions;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._opt_graph = state as Time2AxisLineGraphOptions;

    this.rootHtmlElement.appendChild(template.content.cloneNode(true));
    this._graph_el = this.rootHtmlElement.querySelector(
      '#graph'
    ) as HTMLElement;
    this._graph = new Time2AxisLineGraph();

    this.container.on('resize', () => {
      setTimeout(() => {
        this.draw();
      }, 1);
    });

    this.container.on('maximised', () => {
      setTimeout(() => {
        this.draw();
      }, 1);
    });

    this.container.on('open', () => {
      setTimeout(() => {
        this.draw();
        this._graph_el.appendChild(this._graph.node.node() as SVGSVGElement);
      }, 1);
    });
  }

  get graph(): Time2AxisLineGraph {
    return this._graph;
  }

  private draw(): void {
    this._graph.draw(this._graph_el, this._opt_graph);
    this._graph.data(this._data[0], this._data[1]);
  }

  public update(data: [Data[][], Data[][]]): void {
    this._graph.data(data[0], data[1]);
    this._data = data;
  }
}
