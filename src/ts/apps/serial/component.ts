import { AppComponent } from '../../golden-components/component-base';
import type { SerialApp } from './app';
import { SerialView } from './view';
import {
  type ComponentContainer,
  type JsonValue,
  LayoutManager,
} from 'golden-layout';
import type { TerminalComponent } from '../../golden-components/terminal';

export class SerialComponent extends AppComponent {
  private readonly _view: SerialView;
  private _console: TerminalComponent | null;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    const state_obj = JSON.parse(state as string);

    const port = (
      window.console_app.list.protocol('serial') as SerialApp
    ).list.port_by_id(state_obj.id);
    if (port === undefined)
      throw new Error(`Failed to find port [${state as string}]`);

    this._view = new SerialView(port, state_obj.state);
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this._view.port.name}`);
    this._view.on('disconnect', () => {
      this.container.setTitle(`${this._view.port.name} (disconnected)`);
    });

    this._view.on('state', args => {
      window.console_app.set_state('serial', args);
    });

    this.container.on('beforeComponentRelease', () => {
      if (this._console !== null) this._console.container.close();
      this._view.port.close().finally(() => {});
    });

    port.on('data', d => {
      if (this._console !== null) {
        this._console.terminal.write(d);
      }
    });

    port.on('open', () => {
      if (this._console !== null)
        this._console.title = `${port.name} (console)`;
    });

    port.on('close', () => {
      if (this._console !== null)
        this._console.title = `${port.name} (console/closed)`;
    });

    this._console = null;
    this._view.on('console', open => {
      if (open) {
        const p = this.container.layoutManager.newComponentAtLocation(
          'TerminalComponent',
          state_obj.id,
          undefined,
          [
            { typeId: LayoutManager.LocationSelector.TypeId.FirstRowOrColumn },
            { typeId: LayoutManager.LocationSelector.TypeId.FocusedItem },
            { typeId: LayoutManager.LocationSelector.TypeId.FirstStack },
            { typeId: LayoutManager.LocationSelector.TypeId.Root },
          ]
        );
        this._console = p?.component as TerminalComponent;
        this._console?.container.on('beforeComponentRelease', () => {
          this._view.emit('close_console', undefined);
          this._console = null;
        });
        this._console.title = `${port.name} ${
          port.state === 'open' ? '(console)' : '(console/closed)'
        }`;
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
}
