import type { GoldenLayout, ComponentItem } from 'golden-layout';
import EventEmitter from '../libs/event_emitter';
import type { SetupComponent } from './component';

interface SetupEvents {
  delete_db: undefined;
}

export class Setup extends EventEmitter<SetupEvents> {
  private _component: ComponentItem | null = null;

  public open(layout: GoldenLayout): void {
    if (this._component !== null) {
      this._component.container.focus();
      return;
    }
    this._component = layout.newComponent('SetupComponent');
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
  }

  public info(message: string): void {
    if (this._component === null) return;
    (this._component?.component as SetupComponent).info(message);
  }
}
