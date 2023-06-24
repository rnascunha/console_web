import {
  AppComponent,
  ComponentBase,
} from '../../golden-components/component-base';
import type { SerialApp } from '../app';
import type { SerialConn } from './serial';
import { SerialView, SerialViewConsole } from './view';
import type {
  ComponentContainer,
  JsonValue,
  ContentItem,
  ComponentItem,
} from 'golden-layout';

export class SerialComponent extends AppComponent {
  private readonly _view: SerialView;
  private _console: SerialConsoleComponent | null;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const port = (
      window.console_app.list.protocol('serial') as SerialApp
    ).list.port_by_id(state as number);
    if (port === undefined)
      throw new Error(`Failed to find port [${state as string}]`);

    this._view = new SerialView(port);
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this._view.port.name}`);
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

export class SerialConsoleComponent extends ComponentBase {
  private _console: SerialViewConsole | null;
  private readonly _id: number;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._id = state as number;
    this._console = null;

    /**
     * As the container is not at DOM yet, this is a
     * workaroud to delay until after the constructor
     * (event open didn't work)
     */
    setTimeout(() => {
      const port = (
        window.console_app.list.protocol('serial') as SerialApp
      ).list.port_by_id(this._id) as SerialConn;
      this._console = new SerialViewConsole(port, this.rootHtmlElement);
      this.set_name();
      this.container.on('resize', () => this._console?.terminal.fit());
      this.container.on('beforeComponentRelease', () =>
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
      this.container.setTitle(`${port.name} (console)`);
    else this.container.setTitle(`${port.name} (console/closed)`);
  }
}
