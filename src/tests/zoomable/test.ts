import * as d3 from 'd3';
import flights from './flights.csv';

/**
 * https://observablehq.com/@d3/zoomable-area-chart
 */

const $ = document.querySelector.bind(document);

const graph_el = $('#graph') as HTMLElement;

d3.csv(flights)
  .then(d => {
    const data = d.map(dd => {
      return { date: new Date(dd.date), value: +dd.value };
    });
    graph_el.appendChild(chart(data));
  })
  .finally(() => {});

interface Data {
  date: Date;
  value: number;
}

function chart(data: Data[]): SVGSVGElement {
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 500;
  const margin_top = 20;
  const margin_right = 20;
  const margin_bottom = 30;
  const margin_left = 30;

  // Create the horizontal and vertical scales.
  const x = d3
    .scaleUtc()
    .domain(d3.extent(data, d => d.date) as [Date, Date])
    .range([margin_left, width - margin_right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value)] as [number, number])
    .nice()
    .range([height - margin_bottom, margin_top]);

  // Create the horizontal axis generator, called at startup and when zooming.
  // eslint-disable-next-line
  const xAxis = (
    g: d3.Selection<SVGGElement, undefined, null, undefined>,
    x: d3.ScaleTime<number, number, never>
  ): d3.Selection<SVGGElement, undefined, null, undefined> =>
    g.call(
      d3
        .axisBottom(x)
        .ticks(width / 80)
        .tickSizeOuter(0)
    );

  // The area generator, called at startup and when zooming.
  const area = (dd: any, x: any): string | null =>
    d3
      .area<Data>()
      .curve(d3.curveStepAfter)
      .x(d => x(d.date as any))
      .y0(y(0))
      .y1(d => y(d.value as any))(data as any);

  // Create the zoom behavior.
  const zoom = d3
    .zoom()
    .scaleExtent([1, 32])
    .extent([
      [margin_left, 0],
      [width - margin_right, height],
    ])
    .translateExtent([
      [margin_left, -Infinity],
      [width - margin_right, Infinity],
    ])
    .on('zoom', zoomed);

  // Create the SVG container.
  const svg = d3
    .create<SVGSVGElement>('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'max-width: 100%; height: auto;');

  // Create a clip-path with a unique ID.
  const clip = 'clip';

  svg
    .append('clipPath')
    .attr('id', clip)
    .append('rect')
    .attr('x', margin_left)
    .attr('y', margin_top)
    .attr('width', width - margin_left - margin_right)
    .attr('height', height - margin_top - margin_bottom);

  // Create the area.
  const path = svg
    .append('path')
    .attr('clip-path', `url(#${clip})`)
    .attr('fill', 'steelblue')
    .attr('d', area(data, x) as any);

  // Append the horizontal axis.
  const gx = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin_bottom})`)
    .call(xAxis, x);

  // Append the vertical axis.
  svg
    .append('g')
    .attr('transform', `translate(${margin_left},0)`)
    .call(d3.axisLeft(y).ticks(null, 's'))
    .call(g => g.select('.domain').remove())
    .call(g =>
      g
        .select('.tick:last-of-type text')
        .clone()
        .attr('x', 3)
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold')
        .text('Flights')
    );

  // When zooming, redraw the area and the x axis.
  function zoomed(event: any): void {
    const xz = event.transform.rescaleX(x);
    path.attr('d', area(data, xz) as any);
    gx.call(xAxis, xz);
  }

  // Initial zoom.
  svg
    .call(zoom as any)
    .transition()
    .duration(750)
    .call(zoom.scaleTo as any, 4, [x(Date.UTC(2001, 8, 1)), 0]);

  return svg.node() as SVGSVGElement;
}
