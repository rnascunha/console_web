import {
  type ComponentBase,
  AppComponent,
} from './golden-components/component-base';
import { other_components } from './components';
import {
  type ComponentItem,
  type ContentItem,
  type LayoutConfig,
  type ComponentContainer,
  ItemType,
  GoldenLayout,
  ResolvedComponentItemConfig,
} from 'golden-layout';
import type { SerialList } from './apps/serial/serial';

import {
  type AppOpenParameters,
  type App,
  SerialApp,
  URLApp,
  AppList,
} from './apps/app';
import { WSComponent } from './apps/websocket/component';
import { HTTPComponent } from './apps/http/component';

const console_layout: LayoutConfig = {
  settings: {
    responsiveMode: 'always',
  },
  root: {
    type: ItemType.row,
    content: [],
  },
};

export class ConsoleApp {
  private readonly _layout: GoldenLayout;
  private readonly _sel_protocols: HTMLSelectElement;
  private readonly _btn_connect: HTMLButtonElement;
  private readonly _el_error: HTMLElement;

  private readonly _app_list: AppList;

  constructor(container = document.body) {
    window.console_app = this;

    this._app_list = new AppList([
      new URLApp('ws', WSComponent),
      new URLApp('wss', WSComponent),
      new URLApp('http', HTTPComponent),
      new URLApp('https', HTTPComponent),
      new SerialApp(),
    ]);

    this._layout = new GoldenLayout(
      container.querySelector('#golden') as HTMLElement,
      this.bind_component.bind(this)
    );
    this._layout.resizeWithContainerAutomatically = true;
    this.register_components();

    this._sel_protocols = container.querySelector(
      '#protocols'
    ) as HTMLSelectElement;
    this._btn_connect = container.querySelector(
      '#connect'
    ) as HTMLButtonElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    const proto_container = container.querySelector(
      '#protocol-container'
    ) as HTMLElement;
    this._app_list.apps.forEach((app: App) => {
      this._sel_protocols.appendChild(new Option(app.protocol, app.protocol));
      proto_container.appendChild(app.element);
    });

    this._sel_protocols.onchange = ev => {
      const el = this._app_list.protocol(this._sel_protocols.value)?.element;
      if (el === undefined) throw new Error('Protocol not found');
      this._app_list.apps.forEach(app => {
        const app_el = app.element;
        if (app_el === el)
          (app_el as HTMLElement).style.display = 'inline-block';
        else (app_el as HTMLElement).style.display = 'none';
      });
    };
    this._sel_protocols.dispatchEvent(new Event('change'));

    this._btn_connect.onclick = () => {
      this.open();
    };

    if (this._layout.isSubWindow) {
      container.style.gridTemplate = `"header" 0px
                                      "body" auto
                                      "footer" 0px`;
      this._layout.checkAddDefaultPopinButton();
    } else this._layout.loadLayout(console_layout);
  }

  private bind_component(
    container: ComponentContainer,
    itemConfig: ResolvedComponentItemConfig
  ): ComponentContainer.BindableComponent {
    const comp_name =
      ResolvedComponentItemConfig.resolveComponentTypeName(itemConfig);
    if (comp_name === undefined) throw new Error('Component name not found');

    const comp_type = this.get_component(comp_name);
    if (comp_type === undefined) throw new Error('Component not found');

    const use_virtual = false;
    const component = new comp_type( // eslint-disable-line
      container,
      container.initialState,
      use_virtual
    );
    if (use_virtual) {
      // Somthing here
    }
    return {
      component,
      virtual: use_virtual,
    };
  }

  public get serial_list(): SerialList {
    return (this._app_list.protocol('serial') as SerialApp).list;
  }

  public get layout(): GoldenLayout {
    return this._layout;
  }

  private get protocol(): string {
    return this._sel_protocols.value;
  }

  private open(): void {
    this.error();
    try {
      const app: App | undefined = this._app_list.protocol(this.protocol);
      if (app === undefined)
        throw new Error(`Protocol not found [${this.protocol}]`);
      const parameter: AppOpenParameters = app.open();
      if ('find' in parameter) {
        if (this.find_component(parameter.find as string) !== undefined) return;
      }

      this._layout.addComponent(
        parameter.protocol,
        parameter.state,
        parameter.title
      );
    } catch (e) {
      this.error((e as Error).message);
    }
  }

  private error(message: string = ''): void {
    this._el_error.textContent = message;
  }

  private find_component(
    url: string,
    item: ContentItem | undefined = this._layout.rootItem
  ): ComponentBase | undefined {
    let res;
    item?.contentItems.some(comp => {
      if (!comp.isComponent) {
        res = this.find_component(url, comp);
        if (res === undefined) return true;
      }

      const temp = (comp as ComponentItem).component;
      if (!(temp instanceof AppComponent)) return false;

      if (temp?.reused(url)) {
        res = temp;
        return true;
      }
      return false;
    });
    return res;
  }

  private register_components(): void {
    this._app_list.apps.forEach(app => {
      this._layout.registerComponentConstructor(app.protocol, app.component);
    });
    Object.values(other_components).forEach(v => {
      this._layout.registerComponentConstructor(v.name, v.component);
    });
  }

  private get_component(name: string): any {
    const app = this._app_list.protocol(name);
    if (app !== undefined) return app.component;

    if (name in other_components) return other_components[name].component;

    return undefined;
  }
}
