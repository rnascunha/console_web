import {ComponentBase,
        WSComponent,
        HTTPComponent} from "./components";
import {ComponentItem,
        ContentItem,
        LayoutConfig,
        ItemType,
        GoldenLayout} from 'golden-layout';

interface component {
  readonly name:string;
  readonly component:any;
};

const Components:Record<string, component> = {
  WSComponent: {name: 'WSComponent', component: WSComponent},
  HTTPComponent: {name: 'HTTPComponent', component: HTTPComponent},
};

interface protocol {
  readonly protocol:string;
  readonly component:component;
};

const protocols:Record<string, protocol> = {
  ws:    {protocol: 'ws',     component: Components['WSComponent']},
  wss:   {protocol: 'wss',    component: Components['WSComponent']},
  http:  {protocol: 'http',   component: Components['HTTPComponent']},
  https: {protocol: 'https',  component: Components['HTTPComponent']}
};

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
    Object.values(Components).forEach(v =>
                this._layout.registerComponentConstructor(v.name, v.component));
    this._layout.loadLayout(WSLayout);

    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    Object.values(proto).forEach((v:protocol) =>
      this._sel_protocols.appendChild(new Option(v.protocol, v.protocol, undefined, v.protocol == 'http')));

    this._btn_connect.onclick = () => this.open();
  }

  private open() {
    try {
      this._error();
      const protocol = this._sel_protocols.selectedOptions[0].value;
      const url = `${protocol}://${this._in_url.value}`;
      const comp = this.find_component(url, this._layout.rootItem);
      if (!comp)
        this._layout.addComponent(protocols[protocol].component.name,
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

  public static start() : void {
    if (document.readyState !== "loading") new App();
    else document.addEventListener("DOMContentLoaded", () => new App(), { passive: true });
  }
};
