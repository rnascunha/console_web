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
  type JsonValue,
  ItemType,
  GoldenLayout,
  ResolvedComponentItemConfig,
} from 'golden-layout';
import { type AppOpenParameters, type App, AppList } from './apps/app';
import { type Tool, ToolList } from './tools/tools';
import { open as open_db, type DB } from './libs/db';
import { dispatch_setup } from './setup';

// Binary dump window
import { BinaryDump } from './web-components/binary-dump/binary-dump';
import { create_window } from './helper/window';
import { base64_decode } from './libs/base64';
import type { DraggablePopup } from './web-components/draggable-popup/draggable-popup';

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

interface AppState {
  show_header: boolean;
}

export class ConsoleApp {
  private readonly _layout: GoldenLayout;

  private readonly _container: HTMLElement;
  private readonly _sel_protocols: HTMLSelectElement;
  private readonly _btn_connect: HTMLButtonElement;
  private readonly _el_error: HTMLElement;
  private readonly _el_open_header: HTMLElement;

  private readonly _app_list: AppList;
  private readonly _tool_list: ToolList;

  private readonly _state: AppState = { show_header: true };
  private _db: DB | undefined;

  constructor(
    app_list: App[],
    tool_list: Tool[],
    container: HTMLElement = document.body
  ) {
    window.console_app = this;

    this._container = container;

    this._app_list = new AppList(app_list);
    this._tool_list = new ToolList(tool_list);

    this.load_db()
      .then(async () => {
        await this.update_state();
      })
      .finally(() => {
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
    this._el_open_header = container.querySelector(
      '#open-header'
    ) as HTMLElement;

    const proto_container = container.querySelector(
      '#protocol-container'
    ) as HTMLElement;
    this._app_list.apps.forEach((app: App) => {
      this._sel_protocols.appendChild(new Option(app.protocol, app.protocol));
      proto_container.appendChild(app.element);
    });

    container.querySelector('#tools')?.addEventListener('click', () => {
      const tool = this._tool_list.tool('input_dump');
      if (tool === undefined) return;
      this._layout.addComponent(tool.name, tool.open());
    });

    container.querySelector('#close')?.addEventListener('click', () => {
      this.hide_header();
    });

    container.addEventListener('keypress', ev => {
      if (ev.ctrlKey && ev.key === 'i') {
        this.toggle_header();
      }
    });

    this._el_open_header.addEventListener('click', () => {
      this.show_header();
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

    let setup_window: DraggablePopup | null = null;
    container.querySelector('#setup')?.addEventListener('click', ev => {
      if (setup_window !== null) {
        setup_window.center();
        return;
      }
      if (this._db !== undefined) setup_window = dispatch_setup(this._db);
    });

    if (this._layout.isSubWindow) {
      container.style.gridTemplate = `"header" 0px
                                      "body" auto`;
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
        if (res !== undefined) return true;
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
    this._tool_list.tools.forEach(tool => {
      this._layout.registerComponentConstructor(tool.name, tool.component);
    });
    Object.values(other_components).forEach(v => {
      this._layout.registerComponentConstructor(v.name, v.component);
    });
  }

  private get_component(name: string): any {
    const app_tool =
      this._app_list.protocol(name) ?? this._tool_list.tool(name);
    if (app_tool !== undefined) return app_tool.component;

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
              show_header: false,
              breakline: 8,
            })
          ),
          {
            width: win.clientWidth,
            height: win.clientHeight - win.header.clientHeight,
            left: win.offsetLeft,
            top: win.offsetTop,
          },
          ItemType.row,
          null
        );
        win.close();
      });
    }
  }

  private async load_db(): Promise<void> {
    try {
      this._db = await open_db(dbName, dbVersion);
      const v = await this._db.read_entries('protocol');
      if ('current' in v) this._sel_protocols.value = v.current;
      this._app_list.apps.forEach(app => {
        if (app.protocol in v) app.update(v[app.protocol]);
      });
      this._db.handler.onversionchange = async () => {
        /**
         * Recreating the database when is deleted.
         */
        this._db = await open_db(dbName, dbVersion);
      };
    } catch (e) {
      this._db = undefined;
    }
  }

  private async update_state(): Promise<void> {
    if (this._db === undefined) return;

    await Promise.allSettled([
      this._db.read_entries('apps'),
      this._db.read_entries('tools'),
    ]).then(results => {
      if (results[0].status === 'fulfilled') {
        Object.entries(results[0].value).forEach(
          ([app_name, state]: [string, JsonValue]) => {
            this.set_state(app_name, state, false);
          }
        );
      }
      if (results[1].status === 'fulfilled') {
        Object.entries(results[1].value).forEach(
          ([tool_name, state]: [string, JsonValue]) => {
            this.set_tool_state(tool_name, state, false);
          }
        );
      }
    });
  }

  public set_state(
    app_name: string,
    state: JsonValue,
    update_db: boolean = true
  ): void {
    const app = this._app_list.protocol(app_name);
    if (app === undefined) {
      console.warn(`App '${app_name}' not found`);
      return;
    }
    app.set_state(state);
    if (update_db) this._db?.write('apps', app_name, state).finally(() => {});
  }

  public set_tool_state(
    tool_name: string,
    state: JsonValue,
    update_db: boolean = true
  ): void {
    const tool = this._tool_list.tool(tool_name);
    if (tool === undefined) {
      console.warn(`Tool '${tool_name}' not found`);
      return;
    }
    tool.set_state(state);
    if (update_db) this._db?.write('tools', tool_name, state).finally(() => {});
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

  /**
   * App state
   */
  private toggle_header(): void {
    if (this._state.show_header) this.hide_header();
    else this.show_header();
  }

  private show_header(): void {
    this._container.style.gridTemplate = `"header" min-content
                                          "body" auto`;
    this._el_open_header.style.display = 'none';
    this._state.show_header = true;
  }

  private hide_header(): void {
    this._container.style.gridTemplate = `"header" 0px
                                          "body" auto`;
    this._el_open_header.style.display = 'block';
    this._state.show_header = false;
  }
}
