import type DataDisplay from '../../components/data-display/data-display';

const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type Method = (typeof methods)[number];

async function request(
  url: string,
  method: Method = 'GET',
  body: string = ''
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
      <input class=body-data placeholder=body>
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
  private readonly _in_body: HTMLInputElement;
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
    ) as HTMLInputElement;
    this._sel_method = this._container.querySelector(
      '.http-method'
    ) as HTMLSelectElement;

    (this._container.querySelector('.clear') as HTMLElement).onclick = () => {
      this._data.clear();
    };

    this._btn_request_data.onclick = async (): Promise<void> => {
      await this.request();
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

      this._data.send(
        `[${id}] ${this.method} ${url} body:[${this._in_body.value}]`,
        this._in_body.value.length,
        this._in_body.value
      );
      const response = await request(url, this.method, this._in_body.value);
      if (response.ok) {
        const data = await response.text();
        this._data.receive(
          `[${id}] headers:[${HTTPView.make_headers(response)}] body:[${data}]`,
          data.length,
          data
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