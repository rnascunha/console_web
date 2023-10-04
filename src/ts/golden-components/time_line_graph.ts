import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
// import { create, type DateLineData } from '../libs/d3-graph/time_lines';

// import apple_data from './apple_stocks.json';

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
  private readonly _graph: HTMLElement;
  // private readonly _data: DateLineData[];

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'Time Line Graph';

    this.rootHtmlElement.appendChild(template.content.cloneNode(true));
    this._graph = this.rootHtmlElement.querySelector('#graph') as HTMLElement;

    this.container.on('resize', () => {
      console.log('resize', this._graph);
      this.resize();
    });

    this.container.on('maximised', () => {
      this.resize();
    });

    // this._data = apple_data.map(d => {
    //   return {
    //     date: new Date(d.Date),
    //     value: +d.Close,
    //   };
    // });
  }

  private resize(): void {
    // this._graph.innerHTML = '';
    // this._graph.appendChild(this.create());
  }

  // private create(): SVGSVGElement {
  //   const margin = { top: 20, bottom: 20, left: 30, right: 20 };
  //   return create([this._data], {
  //     width: this._graph.clientWidth - margin.left - margin.right,
  //     height: this._graph.clientHeight - margin.top - margin.bottom,
  //     margin,
  //   });
  // }
}
