import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import {
  Time2AxisLineGraph,
  type Data,
  type Time2AxisLineGraphOptions,
} from '../libs/d3-graph/time_2_axis_line_graph';
import { download } from '../helper/download';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    #graph {
      position: relative;
      overflow: none;
      height: 100%;
      background-color: white;
      padding: 2px;
    }

    #commands {
      position: absolute;
      right: 5px;
      opacity: 0;
      transition: opacity 1s;
    }

    #commands:hover {
      opacity: 1;
    }

    #commands button {
      background-color: transparent;
      border:none;
      cursor: pointer;
    }
  </style>
  <div id=graph>
    <div id=commands>
      <button id=save-graph title="Save graph">💾</button>
    </div>
  </div>`;
  return template;
})();

export class Time2AxisLineGraphComponent extends ComponentBase {
  private readonly _graph_el: HTMLElement;
  private readonly _graph: Time2AxisLineGraph;
  private _data: [Data[][], Data[][]] = [[], []];
  private readonly _opt_graph: Time2AxisLineGraphOptions;

  private _is_draw: boolean = false;

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

    (
      this.rootHtmlElement.querySelector('#save-graph') as HTMLElement
    ).addEventListener('click', () => {
      const svg = (
        this.rootHtmlElement.querySelector('svg') as SVGSVGElement
      ).cloneNode(true) as SVGSVGElement;

      svg.removeAttribute('width');
      svg.removeAttribute('height');

      const source = new XMLSerializer().serializeToString(svg);
      download('graph.svg', source, {
        type: 'data:image/svg+xml;charset=utf-8',
      });
    });
  }

  get graph(): Time2AxisLineGraph {
    return this._graph;
  }

  private draw(): void {
    this._graph.draw(this._graph_el, this._opt_graph);
    this._is_draw = true;
    this.update(this._data);
  }

  public update(data: [Data[][], Data[][]]): void {
    if (!this._is_draw) return;
    this._graph.data(data[0], data[1]);
    this._data = data;
  }
}
