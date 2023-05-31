import {time} from '../../helper';

type type_data = 'comm' | 'recv' | 'send' | 'error';

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

  public send(message:string) {
    this.add_message('send', message);
  }

  public receive(message:string) {
    this.add_message('recv', message);
  }

  public command(message:string) {
    this.add_message('comm', message);
  }

  public error(message:string) {
    this.add_message('error', message);
  }

  public add_message(type:type_data, message:string) {
    const p = document.createElement('pre');
    p.classList.add('command-data', type);
    const size = `${message.length}`.padStart(3, '0');
    
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
