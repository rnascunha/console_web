import {ComponentBase,
        WSComponent,
        HTTPComponent,
        SerialComponent,
        SerialConsoleComponent,
        DockDumpComponent} from "./components";
import {ComponentItem,
        ContentItem,
        LayoutConfig,
        ItemType,
        GoldenLayout,
        ComponentContainer,
        ResolvedComponentItemConfig} from 'golden-layout';
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

const otherComponents:Record<string, OtherComponent> = {
  SerialConsoleComponent: {name: 'SerialConsoleComponent', component: SerialConsoleComponent},
  DockDumpComponent: {name: 'DockDumpComponent', component: DockDumpComponent}
};

function get_component(name:string) {
  if (name in Components)
    return Components[name].component;
  if (name in otherComponents)
    return otherComponents[name].component;

  return undefined;
}

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
    // showPopoutIcon: false,
    // tabOverlapAllowance: 25,
    // reorderOnTabMenuClick: false,
    // tabControlOffset: 5,
    // popoutWholeStack: true,
    // popInOnClose: true,
  },
  root: {
    type: ItemType.row,
    content: []
  }
};

export class App {
  private readonly _layout:GoldenLayout;
  private readonly _sel_protocols:HTMLSelectElement;
  private readonly _btn_connect:HTMLButtonElement;
  private readonly _in_url:HTMLInputElement;
  private readonly _el_error:HTMLElement;

  private readonly _serial_container:HTMLElement;
  private readonly _sel_serial:HTMLSelectElement;
  private readonly _serial_list:SerialList = new SerialList();

  constructor(container = document.body, proto = protocols) {
    window.console_app = this;

    this._layout = new GoldenLayout(container.querySelector('#golden') as HTMLElement,
                                    this.bind_component.bind(this)
                                    );
    this._layout.resizeWithContainerAutomatically = true;
    this._layout.beforeVirtualRectingEvent = (count) => {
      console.log('before rect', count);
    };
    
    this.register_components()

    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    this._serial_container = container.querySelector('#serial-container') as HTMLElement;
    this._sel_serial = container.querySelector('#sel-serial-port') as HTMLSelectElement;

    Object.values(proto).forEach((v:protocol) =>
      this._sel_protocols.appendChild(new Option(v.protocol, v.protocol, undefined, v.protocol == 'http')));

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

    if (this._layout.isSubWindow) {
      container.style.gridTemplate = `"header" 0px
                                      "body" auto
                                      "footer" 0px`;
      // this._layout.clearHtmlAndAdjustStylesForSubWindow();
      this._layout.checkAddDefaultPopinButton();
    } else 
      this._layout.loadLayout(ConsoleLayout);
  }

  private bind_component(container: ComponentContainer, itemConfig: ResolvedComponentItemConfig) : ComponentContainer.BindableComponent {
    const comp_name = ResolvedComponentItemConfig.resolveComponentTypeName(itemConfig);
    if (!comp_name)
      throw new Error("Component name not found");

    const comp_type = get_component(comp_name);
    if (!comp_type)
      throw new Error("Component not found");

    // console.log(container, itemConfig);

    const use_virtual = false;
    const component = new comp_type(container, container.initialState, use_virtual);
    if (use_virtual) {
    //   const componentRootElement = component.0rootHtmlElement;
    //   this._container.appendChild(componentRootElement);
      container.virtualRectingRequiredEvent =
          (container, width, height) => this.handleContainerVirtualRectingRequiredEvent(container, width, height);
      // container.virtualVisibilityChangeRequiredEvent =
      //     (container, visible) => this.handleContainerVirtualVisibilityChangeRequiredEvent(container, visible);
      // container.virtualZIndexChangeRequiredEvent =
      //     (container, logicalZIndex, defaultZIndex) =>
      //         this.handleContainerVirtualZIndexChangeRequiredEvent(container, logicalZIndex, defaultZIndex);
    }
    return {
      component,
      virtual: use_virtual
    };
  }

  // private handleContainerVirtualZIndexChangeRequiredEvent(container: ComponentContainer, logicalZIndex: LogicalZIndex, defaultZIndex: string) {
    // const component = this._boundComponentMap.get(container);
    // if (component === undefined) {
    //     throw new Error('handleContainerVirtualZIndexChangeRequiredEvent: Component not found');
    // }

    // const componentRootElement = component.rootHtmlElement;
    // if (componentRootElement === undefined) {
    //     throw new Error('handleContainerVirtualZIndexChangeRequiredEvent: Component does not have a root HTML element');
    // }

    // componentRootElement.style.zIndex = defaultZIndex;
    // container.element.style.zIndex = defaultZIndex;
  // }

  // private handleContainerVirtualVisibilityChangeRequiredEvent(container: ComponentContainer, visible: boolean) {
  //   const component = this._boundComponentMap.get(container);
  //   if (component === undefined) {
  //       throw new Error('handleContainerVisibilityChangeRequiredEvent: Component not found');
  //   }

  //   const componentRootElement = component.rootHtmlElement;
  //   if (componentRootElement === undefined) {
  //       throw new Error('handleContainerVisibilityChangeRequiredEvent: Component does not have a root HTML element');
  //   }

  //   if (visible) {
  //       componentRootElement.style.display = '';
  //   } else {
  //       componentRootElement.style.display = 'none';
  //   }
  // }

  private handleContainerVirtualRectingRequiredEvent(container: ComponentContainer, width: number, height: number) {
    // console.log(width, height);
    // const component = this._boundComponentMap.get(container);
    // if (component === undefined) {
    //     throw new Error('handleContainerVirtualRectingRequiredEvent: Component not found');
    // }

    // const rootElement = component.rootHtmlElement;
    // if (rootElement === undefined) {
    //     throw new Error('handleContainerVirtualRectingRequiredEvent: Component does not have a root HTML element');
    // }

    // const rootElement = container.element;

    // const containerBoundingClientRect = container.element.getBoundingClientRect();
    // const left = containerBoundingClientRect.left - this._goldenLayoutBoundingClientRect.left;
    // rootElement.style.left = this.numberToPixels(left);
    // const top = containerBoundingClientRect.top - this._goldenLayoutBoundingClientRect.top;
    // rootElement.style.top = this.numberToPixels(top);
    // rootElement.style.width = this.numberToPixels(500);
    // rootElement.style.height = this.numberToPixels(20);
    // this._container.style.width = this.numberToPixels(500);
    // this._container.style.height = this.numberToPixels(50);
  }

  // private numberToPixels(value: number): string {
  //   return value.toString(10) + 'px';
  // }

  // private unbind_component(container: ComponentContainer) {

  // }

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

      const temp = (comp as ComponentItem).component;
      if (!(temp instanceof ComponentBase))
        return false;
      
      const v = temp as ComponentBase;
      if (v && v.reused(url)) {
        res = v;
        return true;
      }
    });
    return res;
  }

  private register_components() {
    //Registering components
    Object.values(Components).forEach(v =>
      this._layout.registerComponentConstructor(v.name, v.component));
    Object.values(otherComponents).forEach(v =>
      this._layout.registerComponentConstructor(v.name, v.component));
  }
};
