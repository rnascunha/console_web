import type { ESPImage, ESPValue } from '../../libs/esp/types';

const config: Record<string, string> = {
  pre_segment: '--',
  pre_value: '-',
  br: '\r\n',
  middle: '.',
};

interface Value {
  name: string;
  value: (arg: any, data: Record<string, any>) => string;
}

interface SegmentInfo {
  name: string;
  data: Record<string, Value>;
}

const segments = ['file', 'hash', 'header', 'header_segment', 'description'];
type Segments = (typeof segments)[number];

const to_string = (arg: any): string => arg.toString();
const value_string = (arg: ESPValue): string => arg.name.toString();
// const arraybuffer_string = (arg: ArrayBuffer): string => {
//   return new Uint8Array(arg).reduce((acc, v) => {
//     acc = acc + v.toString(16).padStart(2, '0');
//     return acc;
//   }, '0x');
// };
const byte_size = (size: number): string =>
  size < 1024 ? `${size}b` : `${Math.floor(size / 1024)}kb`;
const to_hex = (arg: number): string =>
  `0x${arg.toString(16).padStart(2, '0')}`;

const cut_hash = (hash: string): string => {
  return hash.slice(-10);
};
function to_date(date: number): string {
  const d: Date = new Date(date);
  return `${d.getFullYear().toString().padStart(4, '0')}/${d
    .getMonth()
    .toString()
    .padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d
    .getHours()
    .toString()
    .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function spi_output(arg: any, data: Record<string, any>): string {
  return `${value_string(data.spi_mode)} ${value_string(
    data.spi_size
  )} ${value_string(data.spi_speed)}`;
}

const names: Record<string, SegmentInfo> = {
  file: {
    name: 'File Info',
    data: {
      name: { name: 'File', value: (f: File) => f.name },
      size: { name: 'Size', value: (f: File) => byte_size(f.size) },
      // type: { name: 'Type', value: (f: File) => f.type },
      date: { name: 'Date', value: (f: File) => to_date(f.lastModified) },
    },
  },
  hash: {
    name: 'Hash',
    data: {
      hash: {
        name: 'hash',
        value: cut_hash,
      },
    },
  },
  header: {
    name: 'Header',
    data: {
      magic: { name: 'Magic Header', value: to_hex },
      segment_count: { name: 'Segment Count', value: to_string },
      spi_mode: { name: 'SPI', value: spi_output },
      // spi_speed: { name: 'SPI speed', value: value_string },
      // spi_size: { name: 'SPI size', value: value_string },
      entry_addr: { name: 'Entry Addr', value: to_hex },
      // wp_pin: { name: 'WP pin', value: to_string },
      // spi_pin_drv: { name: 'SPI Pin DRV', value: arraybuffer_string },
      chip_id: { name: 'Chip ID', value: value_string },
      min_chid_rev: { name: 'Min Chip Rev', value: to_string },
      // hash_appended: { name: 'Hash appended', value: to_string },
    },
  },
  header_segment: {
    name: 'Header Segment',
    data: {
      load_addr: { name: 'Load Addr', value: to_hex },
      data_len: { name: 'Data Length', value: to_string },
    },
  },
  description: {
    name: 'Description',
    data: {
      magic_word: { name: 'Magic Word', value: to_hex },
      secure_version: { name: 'Secure Version', value: to_string },
      project_name: { name: 'Project Name', value: to_string },
      version: { name: 'Version', value: to_string },
      time: { name: 'Time', value: to_string },
      date: { name: 'Date', value: to_string },
      idf_ver: { name: 'IDF version', value: to_string },
      app_elf_sha256: { name: 'APP Elf sha256', value: cut_hash },
    },
  },
};

interface Val {
  name: string;
  value: string;
}

interface OutputSegment {
  name: string;
  max_name: number;
  max_value: number;
  data: Val[];
}

function output_file_data(
  name: string,
  data: File,
  format: Record<string, Value>
): OutputSegment {
  const output: Val[] = [];
  let max_name = 0;
  let max_value = 0;

  Object.values(format).forEach(val => {
    const value = val.value(data, format);
    max_value = Math.max(max_value, value.length);
    max_name = Math.max(max_name, val.name.length);
    output.push({ name: val.name, value });
  });

  return {
    name: names[name].name,
    max_name,
    max_value,
    data: output,
  };
}

function output_segment_data(
  name: string,
  data: Record<string, any>,
  format: Record<string, Value>
): OutputSegment {
  const output: Val[] = [];
  let max_name = 0;
  let max_value = 0;
  Object.entries(data).forEach(([key, val]) => {
    const d = format[key];
    if (d === undefined) return;
    const value = d.value(val, data);
    max_value = Math.max(max_value, value.length);
    max_name = Math.max(max_name, d.name.length);
    output.push({ name: d.name, value });
  });

  return {
    name: names[name].name,
    max_name,
    max_value,
    data: output,
  };
}

function output_calc(data: ESPImage): Record<string, OutputSegment> {
  const output: Record<string, OutputSegment> = {};

  output.hash = output_segment_data(
    'hash',
    { hash: data.hash },
    names.hash.data
  );
  output.header = output_segment_data('header', data.header, names.header.data);
  output.header_segment = output_segment_data(
    'header_segment',
    data.header_segment,
    names.header_segment.data
  );
  output.description = output_segment_data(
    'description',
    data.description,
    names.description.data
  );

  return output;
}

export function output_image_text(
  file: File,
  data: ESPImage,
  filter: Segments[] = segments
): HTMLElement {
  const adata: Record<string, OutputSegment> = output_calc(data);
  adata.file = output_file_data('file', file, names.file.data);

  const calc = Object.values(adata);

  const max_name = Math.max(...calc.map(v => v.max_name));
  const max_value = Math.max(...calc.map(v => v.max_value));

  const output: string[] = [];
  filter.forEach(f => {
    if (!segments.includes(f)) return;
    const v = adata[f];
    output.push(`${config.pre_segment}${v.name}`);
    v.data.forEach(vv => {
      output.push(
        `${config.pre_value}${vv.name.padEnd(max_name, '.')}${
          config.middle
        }${vv.value.padStart(max_value, '.')}`
      );
    });
  });

  const pre = document.createElement('pre');
  pre.classList.add('parser-container');
  pre.textContent = output.join(config.br);

  return pre;
}

function create_segment_html(
  seg: Record<string, OutputSegment>,
  filter: Segments[] = [
    'file',
    'header_segment',
    'header',
    'hash',
    'description',
  ]
): HTMLElement {
  const pre = document.createElement('pre');
  pre.classList.add('parser-content');
  filter.forEach(f => {
    if (!segments.includes(f) || seg[f] === undefined) return;
    const v = seg[f];

    const fs = document.createElement('fieldset');
    fs.classList.add('parser-container');
    const legend = document.createElement('legend');
    legend.textContent = v.name;

    const div = document.createElement('div');
    v.data.forEach(vv => {
      const dd = document.createElement('div');
      dd.textContent = `${vv.name.padEnd(v.max_name, '.')}${
        config.middle
      }${vv.value.padStart(v.max_value, '.')}`;
      div.appendChild(dd);
    });

    fs.appendChild(legend);
    fs.appendChild(div);
    pre.appendChild(fs);
  });

  return pre;
}

export function output_file_html(file: File): HTMLElement {
  return create_segment_html({
    file: output_file_data('file', file, names.file.data),
  });
}

export function output_image_html(
  file: File,
  data: ESPImage,
  filter: Segments[] = [
    'file',
    'header_segment',
    'hash',
    'header',
    'description',
  ]
): HTMLElement {
  const adata: Record<string, OutputSegment> = output_calc(data);
  adata.file = output_file_data('file', file, names.file.data);

  return create_segment_html(adata, filter);
}
