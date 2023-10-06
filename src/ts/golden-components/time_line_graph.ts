import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import {
  TimeLinesGraph,
  RLTimeLinesGraph,
  type TimeLineGraphOptions,
  type DateLineData,
} from '../libs/d3-graph/time_lines';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    #graph {
      overflow: none;
      height: 100%;
      background-color: white;
    }
  </style>
  <div id=graph></div>`;
  return template;
})();

export class TimeLineGraphComponent extends ComponentBase {
  private readonly _graph_el: HTMLElement;
  private _graph: TimeLinesGraph;
  private _data?: DateLineData[][];
  private readonly _opt_graph: Partial<TimeLineGraphOptions>;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._opt_graph = state as Partial<TimeLineGraphOptions>;

    this.rootHtmlElement.appendChild(template.content.cloneNode(true));
    this._graph_el = this.rootHtmlElement.querySelector(
      '#graph'
    ) as HTMLElement;
    this._graph = new TimeLinesGraph();

    this.container.on('resize', () => {
      this.resize();
    });

    this.container.on('maximised', () => {
      this.resize();
    });

    this.container.on('open', () => {
      setTimeout(() => {
        this.draw();
      }, 1);
    });
  }

  private draw(): void {
    const margin = this._opt_graph.margin ?? {
      top: 20,
      left: 40,
      bottom: 40,
      right: 20,
    };
    const width = this._graph_el.clientWidth - margin.left - margin.right;
    const height = this._graph_el.clientHeight - margin.top - margin.bottom;
    const new_opt = { ...this._opt_graph, margin, width, height };

    this._graph_el.appendChild(this._graph.draw(this._data ?? [], new_opt));
  }

  private resize(): void {
    this._graph_el.innerHTML = '';
    this._graph = new TimeLinesGraph();
    this.draw();
  }

  public update(data: DateLineData[][]): void {
    this._graph.update(data);
    this._data = data;
  }
}

export class RLTimeLineGraphComponent extends ComponentBase {
  private readonly _graph_el: HTMLElement;
  private _graph: RLTimeLinesGraph;
  private _data?: [DateLineData[][], DateLineData[][]];
  private readonly _opt_graph: [
    Partial<TimeLineGraphOptions>,
    Partial<TimeLineGraphOptions>
  ];

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._opt_graph = state as [
      Partial<TimeLineGraphOptions>,
      Partial<TimeLineGraphOptions>
    ];
    console.log('graph', this._opt_graph);

    this.rootHtmlElement.appendChild(template.content.cloneNode(true));
    this._graph_el = this.rootHtmlElement.querySelector(
      '#graph'
    ) as HTMLElement;
    this._graph = new RLTimeLinesGraph();

    this.container.on('resize', () => {
      this.resize();
    });

    this.container.on('maximised', () => {
      this.resize();
    });

    this.container.on('open', () => {
      setTimeout(() => {
        this.draw();
      }, 1);
    });
  }

  private draw(): void {
    const margin = this._opt_graph[0].margin ?? {
      top: 20,
      left: 40,
      bottom: 40,
      right: 40,
    };
    const width = this._graph_el.clientWidth - margin.left - margin.right;
    const height = this._graph_el.clientHeight - margin.top - margin.bottom;
    const new_opt = { ...this._opt_graph[0], margin, width, height };
    const new_opt2 = { ...this._opt_graph[1], margin, width, height };

    this._graph_el.appendChild(
      this._graph.draw(this._data ?? [[], []], [new_opt, new_opt2])
    );
  }

  private resize(): void {
    this._graph_el.innerHTML = '';
    this._graph = new RLTimeLinesGraph();
    this.draw();
  }

  public update(data: [DateLineData[][], DateLineData[][]]): void {
    this._graph.update(data);
    this._data = data;
  }
}
