// import {
//   type DateLineData,
//   TimeLinesGraph,
//   RightAxisTimeLinesGraph,
// } from '../../ts/libs/d3-graph/time_lines';
import { curves } from '../../ts/libs/d3-graph/types';
// import * as d3 from 'd3';
// import { time } from '../../ts/helper/time';
// import { Tooltip } from '../../ts/libs/d3-graph/tooltip';

import { Graph, type Data } from '../../ts/libs/d3-graph/graph';

const $ = document.querySelector.bind(document);

const graph_el = $('#graph') as HTMLElement;
const value = $('#value') as HTMLInputElement;
const add = $('#add') as HTMLElement;
const clear = $('#clear') as HTMLElement;
const remove_first = $('#remove-first') as HTMLElement;
const remove_last = $('#remove-last') as HTMLElement;
const random = $('#random') as HTMLElement;
const random_check = $('#random-after') as HTMLInputElement;
const random_all = $('#random-all') as HTMLElement;
const line_opts = $('#lines-options') as HTMLSelectElement;
// const stroke_width = $('#stroke-width') as HTMLInputElement;

const margin = { top: 20, bottom: 40, left: 30, right: 20 };
// const width = graph_el.clientWidth - margin.left - margin.right;
// const height = graph_el.clientHeight - margin.bottom - margin.top;

const number_lines = 2;

const graph = new Graph();

const data: Data[][] = [];

Object.entries(curves)
  // .filter(([k, v]) => !v.is_close)
  .forEach(([k, v]) => {
    line_opts.appendChild(new Option(k, `${k}`, undefined, k === 'linear'));
  });

random.addEventListener('click', () => {
  randonize();
});

line_opts.addEventListener('change', () => {
  create_graph();
});

add.addEventListener('click', () => {
  if (data.length === 0) {
    create_data();
    update_graph();
    return;
  }

  data.forEach((d, i) => {
    d.push({
      date: new Date(),
      value: i === 0 ? +value.value : simple_random(),
    });
  });

  if (random_check.checked) randonize();

  update_graph();
  if (random_check.checked) randonize();
});

random_all.addEventListener('click', () => {
  randonize_all_values();
  update_graph();
});

clear.addEventListener('click', () => {
  create_data();
  update_graph();
});

remove_first.addEventListener('click', () => {
  data.forEach(d => {
    d.splice(0, 1);
  });
  update_graph();
});

remove_last.addEventListener('click', () => {
  data.forEach(d => {
    d.splice(d.length - 1, 1);
  });
  update_graph();
});

// stroke_width.addEventListener('change', () => {
//   graph.style_line('stroke-width', +stroke_width.value);
// });

randonize();
create_graph();

function update_graph(): void {
  graph.data(data);
}

function create_graph(): void {
  graph_el.innerHTML = '';
  graph_el.appendChild(
    graph
      .draw(graph_el, {
        margin,
      })
      .data(data)
      .node() as SVGSVGElement
  );

  // graph
  //   .x_label('Time')
  //   .attr('x', width / 2)
  //   .attr('y', margin.bottom)
  //   .attr('dy', -0.1 * margin.bottom)
  //   .style('text-anchor', 'middle')
  //   .style('fill', 'black')
  //   .style('font-size', '14px');

  // graph
  //   .y_label('Random number')
  //   .attr('dy', -5)
  //   .attr('transform', 'rotate(90)')
  //   .style('font-size', '14px')
  //   .style('fill', 'black')
  //   .style('text-anchor', 'start');
}

function simple_random(): number {
  return Math.floor(100 * Math.random());
}

function randonize(): void {
  value.value = simple_random().toString();
}

function randonize_all_values(): void {
  for (const arr of data) {
    arr.forEach(d => {
      d.value = simple_random();
    });
  }
}

function create_data(): void {
  data.splice(0, data.length);
  for (let i = 0; i < number_lines; ++i)
    data.push([{ date: new Date(), value: simple_random() }]);
}
