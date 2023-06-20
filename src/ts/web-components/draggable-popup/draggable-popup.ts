const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      position: absolute;
    }

    #header {
      display: flex;
      justify-content: space-between;
      cursor: move;
      z-index: 10;
      border-bottom: 1px solid black;
    }

    .icon {
      cursor: pointer;
      padding: 0px 3px;
      align-self: center;
    }

    .icon:hover {
      color: white;
      background-color: black;
    }

    #body {
      padding: 0;
      margin: 0;
    }

    #body::slotted(*) {
      z-index: 9;
      margin: 0;
      padding: 0;
    }

  </style>
  <div id=header>
    <slot name=header></slot>
    <div class=icon id=undock>&boxbox;</div>
    <div class=icon id=close>&#10006;</div>
  </div>
  <slot id=body></slot>`;

  return template;
})();

export class DraggablePopup extends HTMLElement {
  private _init_x: number = 0;
  private _init_y: number = 0;
  private _end_x: number = 0;
  private _end_y: number = 0;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
    (this.shadowRoot?.querySelector('#header') as HTMLElement).onmousedown =
      ev => {
        this.drag_down(ev);
      };
    (this.shadowRoot?.querySelector('#close') as HTMLElement).onclick = () => {
      this.close();
    };

    (this.shadowRoot?.querySelector('#undock') as HTMLElement).onclick = () => {
      this.dispatchEvent(new Event('undock'));
    };
  }

  public get header(): HTMLElement {
    return this.shadowRoot?.querySelector('#header') as HTMLElement;
  }

  public get body(): HTMLElement {
    return this.shadowRoot?.querySelector('#body') as HTMLElement;
  }

  public close(): void {
    this.parentNode?.removeChild(this);
  }

  public center(): void {
    const parent = this.parentElement?.getClientRects() as DOMRectList;
    const node = this.getClientRects();

    const left = parent[0].width / 2 - node[0].width / 2;
    const top = parent[0].height / 2 - node[0].height / 2;

    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  private drag_down(ev: MouseEvent): void {
    // ev = ev ?? window.event;
    ev.preventDefault();
    // get the mouse cursor position at startup:
    this._init_x = ev.clientX;
    this._init_y = ev.clientY;
    document.onmouseup = () => {
      this.drag_end();
    };
    // call a function whenever the cursor moves:
    document.onmousemove = ev => {
      this.on_drag(ev);
    };
  }

  private on_drag(ev: MouseEvent): void {
    // ev = ev || window.event;
    ev.preventDefault();
    // calculate the new cursor position:
    this._end_x = this._init_x - ev.clientX;
    this._end_y = this._init_y - ev.clientY;
    this._init_x = ev.clientX;
    this._init_y = ev.clientY;
    // set the element's new position:
    this.style.top = `${this.offsetTop - this._end_y}px`;
    this.style.left = `${this.offsetLeft - this._end_x}px`;
  }

  private drag_end(): void {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

customElements.define('draggable-popup', DraggablePopup);
