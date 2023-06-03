import {time} from '../../helper';

type type_data = 'comm' | 'recv' | 'send' | 'error' | 'warn';

const template_class:HTMLTemplateElement = function() : HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      overflow: hidden;
      height: 100%;
      display: block;
    }

    #data {
      overflow: auto;
      height: 100%;
      margin: 0px;
      padding: 0px;
    }

    .command-data {
      margin: 0px;
      padding: 3px;
      white-space: break-spaces;
    }
    
    .comm {
      background-color: lightgray;
    }
    
    .recv {
      background-color: limegreen;
    }
    
    .send {
      background-color: green;
    }
    
    .error {
      background-color: red;
      color: white;
    }

    .warn {
      background-color: yellow;
    }

  </style>
  <div id=data></div>`;
  return template;
}();

export default class DataDisplay extends HTMLElement {
  private _data:HTMLElement;
  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    this.shadowRoot?.appendChild(template_class.content.cloneNode(true));
    this._data = this.shadowRoot?.querySelector('#data') as HTMLElement;
  }

  public clear() {
    this._data.innerHTML = '';
  }

  public send(message:string, message_size?:number) {
    this.add_message('send', message, message_size);
  }

  public receive(message:string, message_size?:number) {
    this.add_message('recv', message, message_size);
  }

  public command(message:string) {
    this.add_message('comm', message);
  }

  public error(message:string) {
    this.add_message('error', message);
  }

  public warning(message:string) {
    this.add_message('warn', message);
  }

  public add_message(type:type_data, message:string, message_size?:number) {
    const p = document.createElement('pre');
    p.classList.add('command-data', type);
    const size = `${message_size ? message_size : message.length}`.padStart(3, '0');
    
    let out = `${time()} `;
    if (type === 'send')
      out += `<<< [${size}]`;
    else if (type === 'recv')
      out += `>>> [${size}]`;
    p.textContent += `${out} ${message}`;
    this._data.appendChild(p);
    this.go_to_bottom();
  }

  public go_to_bottom() {
    this._data.scrollTo(0, this._data.scrollHeight);
  }
}

customElements.define('display-data', DataDisplay);
