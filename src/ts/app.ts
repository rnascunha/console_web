import {WSCompoenent} from "./components";
import {ComponentItem,
        ItemType,
        LayoutConfig,
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

const WSLayout: LayoutConfig = {
  root: {
    type: ItemType.row,
    content: []
  },
};

export class App {
  private _layout:GoldenLayout;
  private _sel_protocols:HTMLSelectElement;
  private _btn_connect:HTMLButtonElement;
  private _in_url:HTMLInputElement;
  private _el_error:HTMLElement;

  constructor(container = document, proto = protocols) {
    this._layout = new GoldenLayout(container.querySelector('#golden') as HTMLElement);
    this._layout.registerComponentConstructor('WSComponent', WSCompoenent);
    this._layout.loadLayout(WSLayout);

    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    proto.forEach((v:protocol) =>
      this._sel_protocols.appendChild(new Option(v.protocol, v.protocol)));

    this._btn_connect.onclick = () => this.open();
  }

  private open() {
    try {
      this._error();
      const url = `${this._sel_protocols.selectedOptions[0].value}://${this._in_url.value}`;
      const comp = this.find_component(url);
      if (comp) {
        if (comp.socket.state == 'CONNECTING') {
          this._error(`Already trying to connect to ${url}`);
          comp.rootHtmlElement.focus();
        } else {
          comp.rootHtmlElement.focus();
          comp.socket = new Websocket(url);
        }
      } else {
        this._layout.addComponent(WSCompoenent.component_name, url, url);
      }
    } catch (e) {
      this._error((e as DOMException).message);
    }
  }

  private _error(message:string = "") {
    this._el_error.textContent = message;
  }

  private find_component(url:string) : WSCompoenent | undefined {
    let res = undefined;
    this._layout.rootItem?.contentItems.some(comp => {
      if (!(comp instanceof ComponentItem))
        return false;
      
      let v = (comp as ComponentItem).component;
      if (v instanceof WSCompoenent &&
          v.socket.url === url &&
          v.socket.state !== 'OPEN') {
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
