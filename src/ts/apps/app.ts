import type { JsonValue } from 'golden-layout';

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

  /**
   * Is this good enough? Shouldn't it be abstract and let
   * the the derived class implement it?
   */
  public focus(): void {
    const el = this._el.firstChild as HTMLElement;
    if ('focus' in el) el.focus();
  }

  get component(): any {
    return this._component;
  }

  abstract open(): AppOpenParameters;
  public update(value: JsonValue): void {}
  public set_state(value: unknown): void {}
}

const url_template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `<input class="url" name=url placeholder="url" />`;
  return template;
})();

export class URLApp<T> extends App {
  private readonly _in_url: HTMLInputElement;
  private _state: T;

  constructor(protocol: string, component: any, state: T) {
    super(protocol, url_template.content.cloneNode(true), component);
    this._in_url = (this.element as HTMLElement).querySelector(
      '.url'
    ) as HTMLInputElement;
    this._state = state;
  }

  public open(): AppOpenParameters {
    try {
      const url = `${this.protocol}://${this._in_url.value}`;
      return {
        protocol: this.protocol,
        find: url,
        state: JSON.stringify({ url, state: this._state }),
        title: url,
      };
    } catch (e) {
      throw new Error((e as DOMException).message);
    }
  }

  public override update(value: JsonValue): void {
    const data = JSON.parse(value as string);
    this._in_url.value = data.url.split('://')[1];
  }

  public override set_state(value: T): void {
    this._state = value;
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
