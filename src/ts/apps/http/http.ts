import type DataDisplay from '../../web-components/data-display/data-display';
import type { BinaryInputSelect } from '../../web-components/binary-input/text-select-binary';
import { binary_to_ascii } from '../../libs/binary-dump';

const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type Method = (typeof methods)[number];

async function request(
  url: string,
  method: Method = 'GET',
  body: string | Uint8Array = ''
): Promise<Response> {
  const options: RequestInit = { method };
  if (body.length !== 0) options.body = body;
  const response = await fetch(url, options);
  return response;
}

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <div>
      <select class=http-method></select>
      <input class=query-url placeholder=query>
      <text-select-binary class=body-data placeholder=body selected=text></text-select-binary>
      <button class=request-data>Request</button>
      <button class=clear>Clear</button>
    </div>
    <display-data class=data></display-data>`;
  const sel = template.content.querySelector('.http-method');
  methods.forEach(v => sel?.appendChild(new Option(v, v)));
  return template;
})();

export class HTTPView {
  private readonly _url: string;

  private _id: number = 0;

  private readonly _container: HTMLElement;
  private readonly _btn_request_data: HTMLButtonElement;
  private readonly _data: DataDisplay;
  private readonly _in_query: HTMLInputElement;
  private readonly _in_body: BinaryInputSelect;
  private readonly _sel_method: HTMLSelectElement;

  constructor(url: string) {
    this._url = url;

    this._container = document.createElement('div');
    this._container.classList.add('golden-content');
    this._container.appendChild(template.content.cloneNode(true));

    this._btn_request_data = this._container.querySelector(
      '.request-data'
    ) as HTMLButtonElement;
    this._data = this._container.querySelector('.data') as DataDisplay;
    this._in_query = this._container.querySelector(
      '.query-url'
    ) as HTMLInputElement;
    this._in_body = this._container.querySelector(
      '.body-data'
    ) as BinaryInputSelect;
    this._sel_method = this._container.querySelector(
      '.http-method'
    ) as HTMLSelectElement;

    (this._container.querySelector('.clear') as HTMLElement).onclick = () => {
      this._data.clear();
    };

    this._btn_request_data.onclick = async (): Promise<void> => {
      await this.request();
    };
    this._in_body.onkeyup = async ev => {
      if (ev.key === 'Enter') await this.request();
    };
  }

  public get url(): string {
    return this._url;
  }

  public get container(): HTMLElement {
    return this._container;
  }

  private get method(): Method {
    return this._sel_method.selectedOptions[0].value as Method;
  }

  public async request(): Promise<void> {
    const id = ++this._id;
    try {
      let url = this._url;
      if (this._in_query.value.length !== 0) url += `?${this._in_query.value}`;

      const binary_data = this._in_body.data;
      const data = binary_to_ascii(binary_data);
      this._data.send(
        `[${id}] ${this.method} ${url} body:[${data}]`,
        binary_data.length,
        binary_data
      );
      const response = await request(url, this.method, binary_data);
      if (response.ok) {
        const data_bin = new Uint8Array(await response.arrayBuffer());
        const data = binary_to_ascii(data_bin);
        this._data.receive(
          `[${id}] headers:[${HTTPView.make_headers(response)}] body:[${data}]`,
          data_bin.length,
          data_bin
        );
      }
    } catch (e) {
      this._data.error(`[${id}] ${(e as TypeError).message}`);
    }
  }

  private static make_headers(response: Response): string {
    const headers: string[] = [];
    response.headers.forEach((v, k) => headers.push(`${k}: ${v}`));

    return headers.join(', ');
  }
}
