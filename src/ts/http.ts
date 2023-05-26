import {time} from './helper';

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
    <div class=data></div>`;
  const sel = template.content.querySelector('.http-method');
  methods.forEach(v => sel?.appendChild(new Option(v, v)));
  return template;
}()

type type_data = 'command' | 'recv-data' | 'send-data' | 'error-data';

export class HTTPView {
  private _url:string;

  private _id:number = 0;
  
  private _container:HTMLElement;
  private _btn_request_data:HTMLButtonElement;
  private _out_data:HTMLElement;
  private _in_query:HTMLInputElement;
  private _in_body:HTMLInputElement;
  private _sel_method:HTMLSelectElement;

  constructor(url:string) {
    this._url = url;

    this._container = document.createElement('div');
    this._container.classList.add('http-connection');
    this._container.appendChild(template.content.cloneNode(true));

    this._btn_request_data = this._container.querySelector('.request-data') as HTMLButtonElement;
    this._out_data = this._container.querySelector('.data') as HTMLElement;
    this._in_query = this._container.querySelector('.query-url') as HTMLInputElement;
    this._in_body = this._container.querySelector('.body-data') as HTMLInputElement;
    this._sel_method = this._container.querySelector('.http-method') as HTMLSelectElement;

    (this._container.querySelector('.clear') as HTMLElement).onclick = () => {
      this._out_data.innerHTML = '';
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

      this._add_message('send-data', `[${id}] ${this.method} ${url} body:[${this._in_body.value}]`, this._in_body.value.length);
      const response = await HTTP.request(url, this.method, this._in_body.value);
      if (response.ok) {
        const data = await response.text();
        this._add_message('recv-data', `[${id}] ${data}`, data.length);
      }
    } catch(e) {
      this._add_message('error-data', `[${id}] ${(e as TypeError).message}`);
    }
  }

  private _add_message(type:type_data, message:string, size:number = 0) {
    const p = document.createElement('pre');
    p.classList.add('command-data', type);
    const size_str = `${size}`.padStart(3, '0');
    
    let out = `${time()} `;
    if (type === 'send-data')
      out += '<<<';
    else if (type === 'recv-data')
      out += '>>>';
    p.textContent += `${out} [${size_str}] ${message}`;
    this._out_data.appendChild(p);
    this._out_data.scrollTo(0, this._out_data.scrollHeight);
  }
};