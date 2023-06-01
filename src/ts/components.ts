import { GoldenLayout, 
         ComponentContainer,
         JsonValue } from "golden-layout";
import { Websocket,
         WebsocketView } from "./websocket";
import { HTTPView } from "./http";
import { SerialView } from "./serial";

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
  }

  public reused(url:string) : Boolean {
    if (url !== `serial://${this._view.port.id}`)
      return false;

    this.container.focus();
    return true;
  } 
}