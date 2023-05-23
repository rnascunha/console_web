import {WSCompoenent} from "./components";
import {GoldenLayout} from 'golden-layout';

interface protocol {
  readonly protocol:string;
  readonly name:string
}

const protocols:Array<protocol> = [
  {protocol: 'ws', name: 'Websocket'},
  {protocol: 'wss', name: 'Secure Wesocket'},
  {protocol: 'http', name: 'HTTP'},
  {protocol: 'https', name: 'Secure HTTP'}
];

/**
 * **********************************************
 */
export class App {
  private _layout:GoldenLayout;
  private _sel_protocols:HTMLSelectElement;
  private _btn_connect:HTMLButtonElement;
  private _in_url:HTMLInputElement;
  private _el_error:HTMLElement;

  constructor(container = document, proto = protocols) {
    this._layout = new GoldenLayout(container.querySelector('#golden') as HTMLElement);
    this._layout.registerComponentConstructor('WSComponent', WSCompoenent);

    this._sel_protocols = container.querySelector('#protocols') as HTMLSelectElement;
    this._btn_connect = container.querySelector('#connect') as HTMLButtonElement;
    this._in_url = container.querySelector('#url') as HTMLInputElement;
    this._el_error = container.querySelector('#error') as HTMLElement;

    proto.forEach((v:protocol) =>
      this._sel_protocols.appendChild(new Option(v.protocol, v.protocol)));

    this._btn_connect.onclick = () => this.open();
  }

  private open() {
    try {
      this._error();
      const url = `${this._sel_protocols.selectedOptions[0].value}://${this._in_url.value}`;
      this._layout.addComponent(WSCompoenent.component_name, url, url);
    } catch (e) {
      console.error('conn', e);
      this._error("Error instantiating websocket");
    }
  }

  private _error(message:string = "") {
    this._el_error.textContent = message;
  }

  public static start() : void {
    if (document.readyState !== "loading") new App();
    else document.addEventListener("DOMContentLoaded", () => new App(), { passive: true });
  }
};
