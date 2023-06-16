import type {
  GoldenLayout,
  ComponentContainer,
  JsonValue,
  ComponentItem,
  ContentItem,
} from 'golden-layout';
import { Websocket, WebsocketView } from '../apps/websocket/websocket';
import { HTTPView } from '../apps/http/http';
import {
  type SerialConn,
  SerialView,
  SerialViewConsole,
} from '../apps/serial/serial';
import { string_to_binary } from '../helper/encode';
import { BinaryDump } from '../components/binary-dump/binary-dump';

interface ConnectComponent {
  reused: (url: string) => boolean;
}

export abstract class ComponentBase
  implements GoldenLayout.VirtuableComponent, ConnectComponent
{
  private readonly _container: ComponentContainer;
  private readonly _root_element: HTMLElement;

  get container(): ComponentContainer {
    return this._container;
  }

  get rootHtmlElement(): HTMLElement {
    return this._root_element;
  }

  constructor(container: ComponentContainer, virtual: boolean) {
    this._container = container;
    if (virtual) {
      this._root_element = document.createElement('div');
      this._root_element.style.position = 'absolute';
      this._root_element.style.overflow = 'hidden';
    } else {
      this._root_element = this._container.element;
    }
  }

  public abstract reused(url: string): boolean;
}

export class WSComponent extends ComponentBase {
  private readonly _view: WebsocketView;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._view = new WebsocketView(new Websocket(state as string));
    this.rootHtmlElement.appendChild(this._view.container);

    this.set_title(`${this.socket.url} (connecting)`);
    this.container.on('beforeComponentRelease', () => {
      this._view.close();
    });

    this._view.on('open', () => {
      this.set_title(`${this.socket.url}`);
    });
    this._view.on('close', () => {
      this.set_title(`${this.socket.url} (closed)`);
    });
  }

  get socket(): Websocket {
    return this._view.socket;
  }

  set socket(s: Websocket) {
    this._view.socket = s;
    this.set_title(`${this.socket.url} (connecting)`);
  }

  set_title(title: string): void {
    this.container.setTitle(title);
    if (this.container.layoutManager.isSubWindow)
      window.document.title = this.container.title;
  }

  public reused(url: string): boolean {
    if (url !== this.socket.url || this.socket.state === 'OPEN') return false;
    if (this.socket.state === 'CONNECTING') {
      this._view.error(`Already trying to connect to ${url}`);
      this.container.focus();
    } else {
      this.socket = new Websocket(url);
      this.container.focus();
    }
    return true;
  }
}

export class HTTPComponent extends ComponentBase {
  private readonly _view: HTTPView;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._view = new HTTPView(state as string); // url
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this._view.url}`);
    if (this.container.layoutManager.isSubWindow)
      window.document.title = this.container.title;
  }

  public is_reusable(url: string): boolean {
    return url === this._view.url;
  }

  public reused(url: string): boolean {
    if (url !== this._view.url) return false;

    this.container.focus();
    return true;
  }
}

export class SerialComponent extends ComponentBase {
  private readonly _view: SerialView;
  private _console: SerialConsoleComponent | null;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const port = window.console_app.serial_list.port_by_id(state as number);
    if (port === undefined)
      throw new Error(`Failed to find port [${state as string}]`);

    this._view = new SerialView(port);
    this.rootHtmlElement.appendChild(this._view.container);

    this._view.on('disconnect', () => {
      this.container.setTitle(`${this._view.port.name} (disconnected)`);
    });

    this.container.on('beforeComponentRelease', () => {
      this._view.port.close().finally(() => {});
    });

    this._console = null;
    this._view.on('console', open => {
      if (open) {
        const p = window.console_app.layout.addComponent(
          'SerialConsoleComponent',
          state as number
        );
        this.find_console_component(state as number, p.parentItem);
        this._console?.container.on('beforeComponentRelease', () => {
          this._view.emit('close_console', undefined);
        });
      } else {
        this._console?.container.focus();
      }
    });
  }

  public reused(url: string): boolean {
    if (url !== `serial://${this._view.port.id}`) return false;

    this.container.focus();
    return true;
  }

  private find_console_component(id: number, parent: ContentItem): boolean {
    parent.contentItems.some(c => {
      if (c?.isComponent) return false;

      const v = (c as ComponentItem).component;
      if (!(v instanceof SerialConsoleComponent)) return false;
      if (v.id === id) this._console = v;
      return true;
    });
    return false;
  }
}

export class SerialConsoleComponent implements GoldenLayout.VirtuableComponent {
  private readonly _container: ComponentContainer;
  private readonly _root_element: HTMLElement;
  private _console: SerialViewConsole | null;
  private readonly _id: number;

  get container(): ComponentContainer {
    return this._container;
  }

  get rootHtmlElement(): HTMLElement {
    return this._root_element;
  }

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    this._container = container;
    if (virtual) {
      this._root_element = document.createElement('div');
      this._root_element.style.position = 'absolute';
      this._root_element.style.overflow = 'hidden';
    } else {
      this._root_element = this._container.element;
    }

    this._id = state as number;

    this._console = null;
    /**
     * As the container is not at DOM yet, this is a
     * workaroud to delay until after the constructor
     * (event open didn't work)
     */
    setTimeout(() => {
      const port = window.console_app.serial_list.port_by_id(
        this._id
      ) as SerialConn;
      this._console = new SerialViewConsole(port, this._root_element);
      this.set_name();
      this._container.on('resize', () => this._console?.terminal.fit());
      this._container.on('beforeComponentRelease', () =>
        this._console?.emit('release', undefined)
      );
      this._console.on('open', () => {
        this.set_name();
      });
      this._console.on('close', () => {
        this.set_name();
      });
    }, 0);
  }

  public get console(): SerialViewConsole | null {
    return this._console;
  }

  public get id(): number {
    return this._id;
  }

  private set_name(): void {
    const port = this._console?.port;
    if (port === undefined) return;
    if (this._console?.port.state === 'open')
      this._container.setTitle(`${port.name} (console)`);
    else this._container.setTitle(`${port.name} (console/closed)`);
  }
}

export class DockDumpComponent implements GoldenLayout.VirtuableComponent {
  private readonly _container: ComponentContainer;
  private readonly _root_element: HTMLElement;
  private readonly _data: Uint8Array;

  get container(): ComponentContainer {
    return this._container;
  }

  get rootHtmlElement(): HTMLElement {
    return this._root_element;
  }

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    this._container = container;
    if (virtual) {
      this._root_element = document.createElement('div');
      this._root_element.style.position = 'absolute';
      this._root_element.style.overflow = 'hidden';
    } else {
      this._root_element = this._container.element;
    }
    this._data = string_to_binary(state as string);

    this.container.setTitle('Binary Dump');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Binary Dump';
    }

    const body = new BinaryDump();
    body.classList.add('window-body');
    body.update(this._data, 8);
    this._root_element.appendChild(body);

    this.container.stateRequestEvent = () => {
      // console.log('event');
      return state;
    };
  }
}
