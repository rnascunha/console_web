import {ComponentBase,
        WSComponent,
        HTTPComponent,
        SerialComponent,
        SerialConsoleComponent} from "./components";
import {ComponentItem,
        ContentItem,
        LayoutConfig,
        ItemType,
        GoldenLayout} from 'golden-layout';
import {SerialList,
        install_serial_events} from "./serial";

interface Component {
  readonly name:string;
  readonly component:any;
  readonly protocols:Array<string>;
};

const Components:Record<string, Component> = {
  WSComponent: {name: 'WSComponent', component: WSComponent, protocols: ['ws', 'wss']},
  HTTPComponent: {name: 'HTTPComponent', component: HTTPComponent, protocols: ['http', 'https']},
  SerialComponent: {name: 'SerialComponent', component: SerialComponent, protocols: ['serial']}
};

interface OtherComponent {
  name: string,
  component: any
}

const otherComponents:Array<OtherComponent> = [
  {name: 'SerialConsoleComponent', component: SerialConsoleComponent}
];

interface protocol {
  readonly protocol:string;
  readonly component:Component;
};

const protocols:Record<string, protocol> = function(){
  const protocols:Record<string, protocol> = {};
  Object.values(Components).forEach(comp => {
    comp.protocols.forEach(proto => {
      protocols[proto] = {protocol: proto, component: comp.component};
    });
  });
  return protocols;
}();

const ConsoleLayout:LayoutConfig = {
  settings: {
    responsiveMode: 'always',
    showPopoutIcon: false
  },
  root: {
    type: ItemType.row,
    content: []
  }
};

export class App {
  private _layout:GoldenLayout;
  private _sel_protocols:HTMLSelectElement;
  private _btn_connect:HTMLButtonElement;
  private _in_url:HTMLInputElement;
  private _el_error:HTMLElement;

  private _serial_container:HTMLElement;
  private _sel_serial:HTMLSelectElement;
  private _serial_list:SerialList;

  constructor(container = document, proto = protocols) {
    this._layout = new GoldenLayout(container.querySelector('#golden') as HTMLElement);
    Object.values(Components).forEach(v =>
                this._layout.registerComponentConstructor(v.name, v.component));
    otherComponents.forEach(v =>
                this._layout.registerComponentConstructor(v.name, v.component));
    this._layout.loadLayout(ConsoleLayout);

    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    this._serial_container = container.querySelector('#serial-container') as HTMLElement;
    this._sel_serial = container.querySelector('#sel-serial-port') as HTMLSelectElement;
    this._serial_list = new SerialList();

    Object.values(proto).forEach((v:protocol) =>
      this._sel_protocols.appendChild(new Option(v.protocol, v.protocol, undefined, v.protocol == 'serial')));

    this._btn_connect.onclick = () => this.open();

    this._sel_protocols.onchange = () => {
      if (this.protocol == 'serial') {
        this._serial_container.style.display = 'inline-block';
        this._in_url.style.display = 'none';
      } else {
        this._serial_container.style.display = 'none';
        this._in_url.style.display = 'inline-block';
      }
    }
    this._sel_protocols.dispatchEvent(new Event('change'));

    install_serial_events(this._serial_list, this._sel_serial);
    (container.querySelector('#serial-request') as HTMLButtonElement).onclick = () => {
      this._serial_list.request();
    }
  }

  public get serial_list() {
    return this._serial_list;
  }

  public get layout() {
    return this._layout;
  }

  private get protocol() {
    return this._sel_protocols.value;
  }

  private open() {
    this._error();
    if (this.protocol == 'serial')
      this.open_serial();
    else
      this.open_url();
  }

  private open_serial() {
    try {
      const serial_id = +this._sel_serial.value;
      if (serial_id === 0) {
        this._error('No port avaiable');
        return;
      }
      if(this.find_component(`serial://${serial_id}`, this._layout.rootItem))
        return;
      this._layout.addComponent(protocols[this.protocol].component.name, serial_id,
                                this._serial_list.port_by_id(serial_id)?.name);
    } catch(e) {
      this._error(e as string);
    }
  }

  private open_url() {
    try {
      const url = `${this.protocol}://${this._in_url.value}`;
      if (this.find_component(url, this._layout.rootItem))
        return;
      this._layout.addComponent(protocols[this.protocol].component.name,
                                url, url);
    } catch (e) {
      this._error((e as DOMException).message);
    }
  }

  private _error(message:string = "") {
    this._el_error.textContent = message;
  }

  private find_component(url:string, item:ContentItem|undefined) : ComponentBase | undefined {
    let res = undefined;
    item?.contentItems.some(comp => {
      if (!comp.isComponent) {
        res = this.find_component(url, comp);
        if (res)
          return true;
      }
      
      let v = ((comp as ComponentItem).component as ComponentBase);
      if (v && v.reused(url)) {
        res = v;
        return true;
      }
    });
    return res;
  }

  private find_component2(fn:(...args:any[]) => boolean, item:ContentItem|undefined) {
    let res = undefined;
    item?.contentItems.some(comp => {
      if (!comp.isComponent) {
        res = this.find_component2(fn, comp);
        if (res)
          return true;
      }
      
      comp
      let v = (comp as ComponentItem).component;
      if (v && fn(v)) {
        res = v;
        return true;
      }
    });
    return res;
  }
};
