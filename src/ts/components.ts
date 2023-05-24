import { GoldenLayout, 
         ComponentContainer,
         JsonValue } from "golden-layout";
import { Websocket, WebsocketView } from "./websocket";

abstract class ComponentBase implements GoldenLayout.VirtuableComponent {
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
}

export class WSCompoenent extends ComponentBase {
  public static readonly component_name:string = 'WSComponent';
  private _view:WebsocketView;

  constructor(_container: ComponentContainer, state: JsonValue | undefined, virtual: boolean) {
    super(_container, state, virtual);

    const url = state as string;

    const socket = new Websocket(url);
    this._view = new WebsocketView(socket);
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this.socket.url} (connecting)`);
    this.container.on('beforeComponentRelease', () => this._view.close());

    this._view.on('close', () => this.container.setTitle(`${this.socket.url} (closed)`));
    this._view.on('open', () => this.container.setTitle(`${this.socket.url}`));
  }

  get socket() : Websocket {
    return this._view.socket;
  }

  set socket(s:Websocket) {
    this._view.socket = s;
    this.container.setTitle(`${this.socket.url} (connecting)`);
  }
}