import type { JsonValue } from 'golden-layout';
import { SerialComponent } from './serial/component';
import { SerialList } from './serial/serial';
import { install_serial_events } from './serial/functions';

export interface AppOpenParameters {
  protocol: string;
  state: JsonValue;
  title?: string;
  find?: string;
}

export abstract class App {
  private readonly _proto: string;
  private readonly _el: HTMLSpanElement = document.createElement('span');
  private readonly _component: any;

  constructor(protocol: string, el: Node, component: any) {
    this._proto = protocol;
    this._el.appendChild(el);
    this._component = component;
  }

  get protocol(): string {
    return this._proto;
  }

  get element(): HTMLSpanElement {
    return this._el;
  }

  get component(): any {
    return this._component;
  }

  abstract open(): AppOpenParameters;
  public update(value: JsonValue): void {}
}

const serial_template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<span id="serial-container">
    <select id="sel-serial-port"></select>
    <button id="serial-request">&#128279;</button>
  </span>`;
  return template;
})();

const url_template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<input id="url" placeholder="url" />`;
  return template;
})();

export class SerialApp extends App {
  private readonly _sel_serial: HTMLSelectElement;
  private readonly _serial_list: SerialList = new SerialList();

  constructor() {
    super('serial', serial_template.content.cloneNode(true), SerialComponent);

    this._sel_serial = (this.element as HTMLElement).querySelector(
      '#sel-serial-port'
    ) as HTMLSelectElement;

    (
      (this.element as HTMLElement).querySelector(
        '#serial-request'
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
      state: serial_id,
    };
  }

  public get list(): SerialList {
    return this._serial_list;
  }
}

export class URLApp extends App {
  private readonly _in_url: HTMLInputElement;
  constructor(protocol: string, component: any) {
    super(protocol, url_template.content.cloneNode(true), component);
    this._in_url = (this.element as HTMLElement).querySelector(
      '#url'
    ) as HTMLInputElement;
  }

  public open(): AppOpenParameters {
    try {
      const url = `${this.protocol}://${this._in_url.value}`;
      return {
        protocol: this.protocol,
        find: url,
        state: url,
        title: url,
      };
    } catch (e) {
      throw new Error((e as DOMException).message);
    }
  }

  public override update(value: JsonValue): void {
    this._in_url.value = (value as string).split('://')[1];
  }
}

export class AppList {
  private readonly _list: Record<string, App> = {};
  constructor(apps: App[] = []) {
    apps.forEach(app => {
      this._list[app.protocol] = app;
    });
  }

  get protocols(): string[] {
    return Object.keys(this._list);
  }

  get apps(): App[] {
    return Object.values(this._list);
  }

  protocol(name: string): App | undefined {
    return this._list[name];
  }
}
