import { App, type AppOpenParameters } from '../app';

import { SerialComponent } from './component';
import { SerialList } from './serial';
import { install_serial_events } from './functions';
import { type SerialState, serialStateDefault } from './view';

const serial_template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
    <select class="sel-serial-port" name=serial></select>
    <button class="serial-request" title="Request ports">&#x1F504;</button>`;
  return template;
})();

export class SerialApp extends App {
  private readonly _sel_serial: HTMLSelectElement;
  private readonly _serial_list: SerialList = new SerialList();
  private _state: SerialState = serialStateDefault;

  constructor() {
    super('serial', serial_template.content.cloneNode(true), SerialComponent);

    this._sel_serial = (this.element as HTMLElement).querySelector(
      '.sel-serial-port'
    ) as HTMLSelectElement;

    (
      (this.element as HTMLElement).querySelector(
        '.serial-request'
      ) as HTMLButtonElement
    ).onclick = () => {
      this._serial_list.request();
    };

    install_serial_events(this._serial_list, this._sel_serial);
  }

  public open(): AppOpenParameters {
    const serial_id = +this._sel_serial.value;
    if (serial_id === 0) {
      throw new Error('No port avaiable');
    }

    return {
      find: `serial://${serial_id}`,
      protocol: this.protocol,
      state: JSON.stringify({ id: serial_id, state: this._state }),
    };
  }

  public get list(): SerialList {
    return this._serial_list;
  }

  public override set_state(state: SerialState): void {
    this._state = state;
  }
}
