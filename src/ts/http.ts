import DataDisplay from './components/data-display/data-display';

const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type method = typeof methods[number];

class HTTP {
  public static async request(url:string, method:method = 'GET', body:string = '') {
    const options:RequestInit = {method};
    if (body)
      options.body = body;
    const response = await fetch(url, options);
    return response;
  }
};

const template = function() {
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
}()

export class HTTPView {
  private _url:string;

  private _id:number = 0;
  
  private _container:HTMLElement;
  private _btn_request_data:HTMLButtonElement;
  private _data:DataDisplay;
  private _in_query:HTMLInputElement;
  private _in_body:HTMLInputElement;
  private _sel_method:HTMLSelectElement;

  constructor(url:string) {
    this._url = url;

    this._container = document.createElement('div');
    this._container.classList.add('golden-content');
    this._container.appendChild(template.content.cloneNode(true));

    this._btn_request_data = this._container.querySelector('.request-data') as HTMLButtonElement;
    this._data = this._container.querySelector('.data') as DataDisplay;
    this._in_query = this._container.querySelector('.query-url') as HTMLInputElement;
    this._in_body = this._container.querySelector('.body-data') as HTMLInputElement;
    this._sel_method = this._container.querySelector('.http-method') as HTMLSelectElement;

    (this._container.querySelector('.clear') as HTMLElement).onclick = () => {
      this._data.innerHTML = '';
    }

    this._btn_request_data.onclick = () =>  this.request();
  }

  public get url() : string {
    return this._url;
  }

  public get container() : HTMLElement {
    return this._container;
  }

  private get method() : method {
    return this._sel_method.selectedOptions[0].value as method;
  }

  public async request() {
    const id = ++this._id;
    try {
      let url = this._url;
      if (this._in_query.value)
        url += `?${this._in_query.value}`;

      this._data.send(`[${id}] ${this.method} ${url} body:[${this._in_body.value}]`);
      const response = await HTTP.request(url, this.method, this._in_body.value);
      if (response.ok) {
        const data = await response.text();
        this._data.receive(`[${id}] ${data}`);
      }
    } catch(e) {
      this._data.error(`[${id}] ${(e as TypeError).message}`);
    }
  }
};