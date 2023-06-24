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
    open_db(dbName, dbVersion)
      .then(async (db: DB) => {
        this._db = db;
        return await this._db.read_iterator('protocol');
      })
      .then(v => {
        if ('current' in v) this._sel_protocols.value = v.current;
        this._app_list.apps.forEach(app => {
          if (app.protocol in v) {
            app.update(v[app.protocol]);
          }
        });
      })
      .catch(() => {
        this._db = undefined;
      })
      .finally(() => {
        this._sel_protocols.dispatchEvent(new Event('change'));
      });

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

    this._sel_protocols.onchange = () => {
      const el = this._app_list.protocol(this._sel_protocols.value)?.element;
      if (el === undefined) throw new Error('Protocol not found');
      this._app_list.apps.forEach(app => {
        const app_el = app.element;
        if (app_el === el)
          (app_el as HTMLElement).style.display = 'inline-block';
        else (app_el as HTMLElement).style.display = 'none';
      });
    };

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
}
