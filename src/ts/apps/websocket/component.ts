import { AppComponent } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { WebsocketView, Websocket } from './websocket';

export class WSComponent extends AppComponent {
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
