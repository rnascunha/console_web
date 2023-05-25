import {ComponentBase,
        WSComponent,
        HTTPComponent} from "./components";
import {ComponentItem,
        ContentItem,
        LayoutConfig,
        ItemType,
        GoldenLayout} from 'golden-layout';
import { Websocket } from "./websocket";

interface protocol {
  readonly protocol:string;
  readonly name:string
}

const protocols:Array<protocol> = [
  {protocol: 'ws', name: 'Websocket'},
  {protocol: 'wss', name: 'Secure Wesocket'},
  {protocol: 'http', name: 'HTTP'},
  {protocol: 'https', name: 'Secure HTTP'}
];

const WSLayout:LayoutConfig = {
  settings: {
    responsiveMode: 'always'
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

  constructor(container = document, proto = protocols) {
    this._layout = new GoldenLayout(container.querySelector('#golden') as HTMLElement);
    this._layout.registerComponentConstructor('WSComponent', WSComponent);
    this._layout.registerComponentConstructor('HTTPComponent', HTTPComponent);
    this._layout.loadLayout(WSLayout);

    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    proto.forEach((v:protocol) =>
      this._sel_protocols.appendChild(new Option(v.protocol, v.protocol, undefined, v.protocol == 'http')));

    this._btn_connect.onclick = () => this.open();
  }

  private open() {
    const protocol = this._sel_protocols.selectedOptions[0].value;
    if (['ws', 'wss'].includes(protocol)) {
      this.ws_open(protocol);
    } else {
      this.http_open(protocol);
    }
  }

  private ws_open(protocol:string) {
    try {
      this._error();
      const url = `${protocol}://${this._in_url.value}`;
      const comp = this.find_component(url, this._layout.rootItem);
      if (comp) {
        if (comp.socket.state == 'CONNECTING') {
          this._error(`Already trying to connect to ${url}`);
          comp.container.focus();
        } else {
          comp.socket = new Websocket(url);
          comp.container.focus();
        }
      } else {
        this._layout.addComponent(WSComponent.component_name, url, url);
      }
    } catch (e) {
      this._error((e as DOMException).message);
    }
  }

  private http_open(protocol:string) {
    try {
      this._error();
      const url = `${protocol}://${this._in_url.value}`;
      const comp = this.find_component(url, this._layout.rootItem);
      if (comp)
        comp.container.focus();
      else
        this._layout.addComponent(HTTPComponent.component_name, url, url);
    } catch (e) {
      this._error((e as DOMException).message);
    }
  }

  private _error(message:string = "") {
    this._el_error.textContent = message;
  }

  private find_component(url:string, item:ContentItem|undefined) : WSComponent | undefined {
    let res = undefined;
    item?.contentItems.some(comp => {
      if (!comp.isComponent) {
        res = this.find_component(url, comp);
        if (res)
          return true;
      }
      
      let v = ((comp as ComponentItem).component as ComponentBase);
      if (v && v.is_reusable(url)) {
        res = v;
        return true;
      }
    });
    return res;
  }

  public static start() : void {
    if (document.readyState !== "loading") new App();
    else document.addEventListener("DOMContentLoaded", () => new App(), { passive: true });
  }
};
