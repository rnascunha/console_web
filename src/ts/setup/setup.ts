import type { GoldenLayout, ComponentItem } from 'golden-layout';
import EventEmitter from '../libs/event_emitter';
import type { SetupComponent } from './component';
import * as monaco from 'monaco-editor';

export interface SetupOptions {
  coder_theme?: string;
}

interface SetupEvents {
  delete_db: undefined;
  state: SetupOptions;
}

export class Setup extends EventEmitter<SetupEvents> {
  private _state: SetupOptions = { coder_theme: 'vs' };
  private _component: ComponentItem | null = null;

  public open(layout: GoldenLayout): void {
    if (this._component !== null) {
      this._component.container.focus();
      return;
    }
    this._component = layout.newComponent('SetupComponent', this._state);
    this._component.on('beforeItemDestroyed', () => {
      this._component = null;
    });
    this._component.element.addEventListener(
      'delete-db',
      () => {
        this.emit('delete_db', undefined);
      },
      true
    );

    this._component.element.addEventListener('coder-theme', ev => {
      this._state.coder_theme = (ev as CustomEvent).detail;
      this.apply_state();
      this.emit('state', this._state);
    });
  }

  public info(message: string): void {
    if (this._component === null) return;
    (this._component?.component as SetupComponent).info(message);
  }

  public set_state(state: SetupOptions): void {
    if (state === undefined) return;
    this._state = state;
    this.apply_state();
    this.emit('state', this._state);
  }

  public update_state(state: SetupOptions): void {
    this._state = { ...this._state, ...state };
    this.apply_state();
    this.emit('state', this._state);
  }

  private apply_state(): void {
    if (this._state.coder_theme !== undefined)
      monaco.editor.setTheme(this._state.coder_theme);
  }
}
