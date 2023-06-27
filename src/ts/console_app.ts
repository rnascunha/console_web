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
import { type AppOpenParameters, type App, AppList } from './apps/app';
import { open as open_db, type DB } from './libs/db';

// Binary dump window
import { BinaryDump } from './web-components/binary-dump/binary-dump';
import { create_window } from './helper/window';
import { base64_decode } from './libs/base64';

const console_layout: LayoutConfig = {
  settings: {
    responsiveMode: 'always',
  },
  root: {
    type: ItemType.row,
    content: [],
  },
};

const dbName = 'console_web';
const dbVersion = 1;

export class ConsoleApp {
  private readonly _layout: GoldenLayout;
  private readonly _sel_protocols: HTMLSelectElement;
  private readonly _btn_connect: HTMLButtonElement;
  private readonly _el_error: HTMLElement;

  private readonly _app_list: AppList;
  private _db: DB | undefined;

  constructor(app_list: App[], container: HTMLElement = document.body) {
    window.console_app = this;

    this._app_list = new AppList(app_list);
    this.load_db().finally(() => {
      this._sel_protocols.dispatchEvent(new Event('change'));
    });

    this._layout = new GoldenLayout(
      container.querySelector('#golden') as HTMLElement,
      this.bind_component.bind(this),
      this.unbind_component.bind(this)
    );

    this._layout.container.addEventListener('click-data', ev => {
      this.byte_dump_window((ev as CustomEvent).detail.data);
    });

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

    this._sel_protocols.onchange = () => {
      this.select_protocol();
    };

    this._btn_connect.onclick = () => {
      this.open();
    };

    proto_container.onkeyup = ev => {
      if (ev.key === 'Enter') this.open();
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

  private unbind_component(container: ComponentContainer): void {
    if (container.virtual) {
      this._layout.container.removeChild(container.element);
    }
  }

  public get list(): AppList {
    return this._app_list;
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
      if (
        !('find' in parameter) ||
        this.find_component(parameter.find as string) === undefined
      ) {
        this._layout.addComponent(
          parameter.protocol,
          parameter.state,
          parameter.title
        );
      }
      this._db?.write('protocol', 'current', this.protocol).finally(() => {});
      this._db
        ?.write('protocol', this.protocol, parameter.state)
        .finally(() => {});
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

  private byte_dump_window(data: string): void {
    const d = base64_decode(data);
    const body = new BinaryDump(8, d, { hide: ['octal', 'binary'] });

    const win = create_window('Binary Dump', body, {
      append: true,
      center: true,
      hide_undock: this._layout.isSubWindow,
    });
    if (!this._layout.isSubWindow) {
      win.addEventListener('undock', () => {
        window.console_app.layout.createPopout(
          window.console_app.layout.newComponent(
            'DockDumpComponent',
            JSON.stringify({
              data,
              hide: ['octal', 'binary'],
            })
          ),
          {
            width: win.clientWidth,
            height: win.clientHeight - win.header.clientHeight,
            left: win.offsetLeft,
            top: win.offsetTop,
          },
          null,
          null
        );
        win.close();
      });
    }
  }

  private async load_db(): Promise<void> {
    try {
      this._db = await open_db(dbName, dbVersion);
      const v = await this._db.read_iterator('protocol');
      if ('current' in v) this._sel_protocols.value = v.current;
      this._app_list.apps.forEach(app => {
        if (app.protocol in v) app.update(v[app.protocol]);
      });
    } catch (e) {
      this._db = undefined;
    }
  }

  private select_protocol(): void {
    const el = this._app_list.protocol(this._sel_protocols.value)?.element;
    if (el === undefined) throw new Error('Protocol not found');
    this._app_list.apps.forEach(app => {
      const app_el = app.element;
      if (app_el === el) {
        (app_el as HTMLElement).style.display = 'inline-block';
        app.focus();
      } else (app_el as HTMLElement).style.display = 'none';
    });
  }
}
