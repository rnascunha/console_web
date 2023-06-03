import { GoldenLayout, 
         ComponentContainer,
         JsonValue,
         ComponentItem, 
         ContentItem} from "golden-layout";
import { Websocket,
         WebsocketView } from "./websocket";
import { HTTPView } from "./http";
import { SerialConn,
         SerialView,
         SerialViewConsole } from "./serial";

interface ConnectComponent {
  reused(url:string) : Boolean;
};

export abstract class ComponentBase implements GoldenLayout.VirtuableComponent, ConnectComponent {
  private _rootElement: HTMLElement;

  get container(): ComponentContainer { return this._container; }
  get rootHtmlElement(): HTMLElement { return this._rootElement; }

  constructor(private _container: ComponentContainer, state: JsonValue | undefined , virtual: boolean) {
    if (virtual) {
      this._rootElement = document.createElement('div');
      this._rootElement.style.position = 'absolute';
      this._rootElement.style.overflow = 'hidden';
    } else {
      this._rootElement = this._container.element;
    }
  }

  public abstract reused(url: string): Boolean;
}

export class WSComponent extends ComponentBase {
  private _view:WebsocketView;

  constructor(_container: ComponentContainer, state: JsonValue | undefined, virtual: boolean) {
    super(_container, state, virtual);

    this._view = new WebsocketView(new Websocket(state as string));
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this.socket.url} (connecting)`);
    this.container.on('beforeComponentRelease', () => this._view.close());

    this._view.on('open', () => this.container.setTitle(`${this.socket.url}`));
    this._view.on('close', () => this.container.setTitle(`${this.socket.url} (closed)`));
  }

  get socket() : Websocket {
    return this._view.socket;
  }

  set socket(s:Websocket) {
    this._view.socket = s;
    this.container.setTitle(`${this.socket.url} (connecting)`);
  }

  public reused(url: string): Boolean {
    if (url !== this.socket.url || this.socket.state === 'OPEN')
      return false;
    if (this.socket.state == 'CONNECTING') {
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
  private _view:HTTPView;

  constructor(_container: ComponentContainer, state: JsonValue | undefined, virtual: boolean) {
    super(_container, state, virtual);

    this._view = new HTTPView(state as string); // url
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this._view.url}`);
  }

  public is_reusable(url:string) : Boolean {
    return url == this._view.url;
  }

  public reused(url: string): Boolean {
    if (url != this._view.url)
      return false;

    this.container.focus();
    return true;
  }
}

export class SerialComponent extends ComponentBase {
  private _view:SerialView;
  private _console:SerialConsoleComponent | null;

  constructor(_container: ComponentContainer, state: JsonValue | undefined, virtual: boolean) {
    super(_container, state, virtual);

    const port = window.console_app.serial_list.port_by_id((state as number));
    if (!port)
      throw `Failed to find port [${state}]`;

    this._view = new SerialView(port);
    this.rootHtmlElement.appendChild(this._view.container);

    this._view.on('disconnect', () =>
      this.container.setTitle(`${this._view.port.name} (disconnected)`));

    this.container.on('beforeComponentRelease', () => this._view.port.close());

    this._console = null;
    this._view.on('console', open => {
      if (open) {
        const p = window.console_app.layout.addComponent('SerialConsoleComponent', state as number);
        this.find_console_component(state as number, p.parentItem);
        this._console?.container.on('beforeComponentRelease', () => this._view.emit('close_console', undefined));
      } else {
        this._console?.container.focus();
      }
    });
  }

  public reused(url:string) : Boolean {
    if (url !== `serial://${this._view.port.id}`)
      return false;

    this.container.focus();
    return true;
  }
  
  private find_console_component(id:number, parent:ContentItem) {
    let vv = null;
    parent.contentItems.some(c => {
      if (!c || !c.isComponent)
        return false;

      const v = (c as ComponentItem).component;
      if (!(v instanceof SerialConsoleComponent))
        return false;
      if ((v as SerialConsoleComponent).id === id)
      this._console = v as SerialConsoleComponent;
      return true;
    });
    return vv;
  }
}

export class SerialConsoleComponent implements GoldenLayout.VirtuableComponent {
  private _rootElement: HTMLElement;
  private _console:SerialViewConsole | null;
  private _id:number;

  get container(): ComponentContainer { return this._container; }
  get rootHtmlElement(): HTMLElement { return this._rootElement; }

  constructor(private _container: ComponentContainer, state: JsonValue | undefined , virtual: boolean) {
    if (virtual) {
      this._rootElement = document.createElement('div');
      this._rootElement.style.position = 'absolute';
      this._rootElement.style.overflow = 'hidden';
    } else {
      this._rootElement = this._container.element;
    }

    this._id = state as number;

    this._console = null;
    /**
     * As the container is not at DOM yet, this is a
     * workaroud to delay until after the constructor
     * (envet open dint work)
     */
    setTimeout(() => {
      const port = window.console_app.serial_list.port_by_id(this._id) as SerialConn;
      this._console = new SerialViewConsole(port, this._rootElement);
      this.set_name();
      this._container.on('resize', () => this._console?.terminal.fit());
      this._container.on('beforeComponentRelease', () => this._console?.emit('release', undefined));
      this._console.on('open', () => this.set_name());
      this._console.on('close', () => this.set_name());
    }, 0);
  }

  public get console() {
    return this._console;
  }

  public get id() {
    return this._id;
  }

  private set_name() {
    const port = this._console?.port;
    if (!port)
      return;
    if (this._console?.port.state == 'open')
      this._container.setTitle(`${port.name} (console)`)
    else
    this._container.setTitle(`${port.name} (console/closed)`)
  }
}