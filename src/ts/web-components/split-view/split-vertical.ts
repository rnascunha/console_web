const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      flex-direction: column;
    }

    ::slotted(*) {
      height: 100%;
    }

    #bottom {
      flex: 1 1 0%;
    }

    #border {
      background-color: var(--border-color, lightgrey);
      height: var(--border-width, 4px);
      cursor: row-resize;
    }
  </style>
  <div id=top>
    <slot></slot>
  </div>
  <div id=border></div>
  <div id=bottom>
    <slot name=bottom></slot>
  </div>`;
  return template;
})();

export class SplitVertical extends HTMLElement {
  private readonly _top: HTMLElement;
  private readonly _border: HTMLElement;
  private readonly _bottom: HTMLElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._top = shadow.querySelector('#top') as HTMLElement;
    this._border = shadow.querySelector('#border') as HTMLElement;
    this._bottom = shadow.querySelector('#bottom') as HTMLElement;

    this._border.addEventListener('mousedown', ev => {
      this.on_down(ev);
    });
  }

  private on_down(ev: MouseEvent): void {
    this.addEventListener('mousemove', this.on_move);
    this.addEventListener('mouseup', this.on_up);
  }

  private on_move(ev: MouseEvent): void {
    this.style.cursor = 'row-resize';

    this._top.style.userSelect = 'none';
    this._top.style.pointerEvents = 'none';

    this._bottom.style.userSelect = 'none';
    this._bottom.style.pointerEvents = 'none';

    const h = (ev.offsetY * 100) / this.getBoundingClientRect().height;
    this._top.style.height = `${h}%`;

    this.dispatchEvent(new Event('resizing'));
  }

  private on_up(ev: MouseEvent): void {
    this._border.style.removeProperty('cursor');
    this.style.removeProperty('cursor');

    this._top.style.removeProperty('user-select');
    this._top.style.removeProperty('pointer-events');

    this._bottom.style.removeProperty('user-select');
    this._bottom.style.removeProperty('pointer-events');

    this.removeEventListener('mousemove', this.on_move);
    this.removeEventListener('mouseup', this.on_up);

    this.dispatchEvent(new Event('resized'));
  }
}

customElements.define('split-vertical', SplitVertical);
