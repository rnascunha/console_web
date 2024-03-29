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
import { SerialList } from './libs/serial/serial';
import { type AppOpenParameters, type App, AppList } from './apps/app';
import { type Tool, ToolList } from './tools/tools';
import { open as open_db, type DB } from './libs/db';
import { Setup, type SetupOptions } from './setup/setup';

// Binary dump window
import { BinaryDump } from './web-components/binary-dump/binary-dump';
import { create_window } from './helper/window';
import { base64_decode } from './libs/base64';

const console_layout: LayoutConfig = {
  settings: {
    responsiveMode: 'always',
    showPopoutIcon: false,
  },
  root: {
    type: ItemType.row,
    content: [],
  },
};

const DB_NAME = 'console_web';
const DB_VERSION = 1;

interface AppState {
  show_header: boolean;
}

export interface ToolConfig {
  tool: Tool;
  title: string;
  icon: string;
}

export class ConsoleApp {
  private readonly _layout: GoldenLayout;

  private static readonly _serial_list: SerialList = new SerialList();

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
    tools_config: ToolConfig[],
    container: HTMLElement = document.body
  ) {
    window.console_app = this;

    this._container = container;

    this._app_list = new AppList(app_list);
    this._tool_list = new ToolList(tools_config.map(({ tool }) => tool));

    const setup = new Setup();

    this.load_db()
      .then(async () => {
        await this.update_state(setup);
      })
      .finally(() => {
        // this delay is required as some components (tools/app) need
        // to de container be totally constructed.
        setTimeout(() => {
          this.open_link(setup);
        }, 0);
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

    const dropdown = container.querySelector('#menu-tools') as HTMLElement;
    tools_config.forEach(d => {
      const s = document.createElement('span');
      s.innerHTML = d.icon;
      s.classList.add('option', 'tool');
      s.title = d.title;
      s.addEventListener('click', () => {
        this._layout.addComponent(d.tool.name, d.tool.open());
      });

      dropdown.appendChild(s);
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

    setup.on('delete_db', () => {
      this._db
        ?.clear(true)
        .then(() => {
          setup.info('Database delete');
        })
        .catch(e => {
          setup.info((e as Error).message);
        });
    });
    container.querySelector('#setup')?.addEventListener('click', () => {
      setup.open(this._layout);
    });

    setup.on('state', state => {
      this._db?.write('setup', 'state', state).finally(() => {});
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

  public static get serial_list(): SerialList {
    return ConsoleApp._serial_list;
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
      this._db = await open_db(DB_NAME, DB_VERSION);
      const v = await this._db.read_entries('protocol');
      if ('current' in v) this._sel_protocols.value = v.current;
      this._app_list.apps.forEach(app => {
        if (app.protocol in v) app.update(v[app.protocol]);
      });
      this._db.handler.onversionchange = async () => {
        /**
         * Recreating the database when is deleted.
         */
        this._db = await open_db(DB_NAME, DB_VERSION);
      };
    } catch (e) {
      this._db = undefined;
    }
  }

  private async update_state(setup: Setup): Promise<void> {
    if (this._db === undefined) return;

    await Promise.allSettled([
      this._db.read_entries('apps'),
      this._db.read_entries('tools'),
      this._db.read_entries('setup'),
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
      if (results[2].status === 'fulfilled') {
        setup.set_state(results[2].value.state as SetupOptions);
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

  public get_tool_state(name: string): any {
    const tool = this._tool_list.tool(name);
    if (tool === undefined) return;
    return tool.open();
  }

  private open_link(setup: Setup): void {
    const url = new URL(window.location.href);

    url.searchParams.forEach((value, key) => {
      switch (key) {
        case 'header':
          if (value === 'false') this.hide_header();
          break;
        case 'coder-theme':
          setup.update_state({ coder_theme: value });
          break;
        case 'tool': {
          const tool = this._tool_list.tool(value);
          if (tool !== undefined && typeof tool.open_link === 'function')
            this._layout.addComponent(tool.name, tool.open_link(url));
        }
      }
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
