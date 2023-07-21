const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
    }

    #right {
      flex: 1 1 0%;
    }

    #border {
      background-color: var(--border-color, lightgrey);
      width: var(--border-width, 4px);
      cursor: col-resize;
    }
  </style>
  <div id=left>
    <slot></slot>
  </div>
  <div id=border></div>
  <div id=right>
    <slot name=right></slot>
  </div>`;
  return template;
})();

export class SplitHorizontal extends HTMLElement {
  private readonly _left: HTMLElement;
  private readonly _border: HTMLElement;
  private readonly _right: HTMLElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._left = shadow.querySelector('#left') as HTMLElement;
    this._border = shadow.querySelector('#border') as HTMLElement;
    this._right = shadow.querySelector('#right') as HTMLElement;

    this._border.addEventListener('mousedown', ev => {
      this.on_down(ev);
    });
  }

  private on_down(ev: MouseEvent): void {
    this.addEventListener('mousemove', this.on_move);
    this.addEventListener('mouseup', this.on_up);
  }

  private on_move(ev: MouseEvent): void {
    this.style.cursor = 'col-resize';

    this._left.style.userSelect = 'none';
    this._left.style.pointerEvents = 'none';

    this._right.style.userSelect = 'none';
    this._right.style.pointerEvents = 'none';

    const w = (ev.offsetX * 100) / this.getBoundingClientRect().width;
    this._left.style.width = `${w}%`;
  }

  private on_up(ev: MouseEvent): void {
    this._border.style.removeProperty('cursor');
    this.style.removeProperty('cursor');

    this._left.style.removeProperty('user-select');
    this._left.style.removeProperty('pointer-events');

    this._right.style.removeProperty('user-select');
    this._right.style.removeProperty('pointer-events');

    this.removeEventListener('mousemove', this.on_move);
    this.removeEventListener('mouseup', this.on_up);
  }
}

customElements.define('split-horizontal', SplitHorizontal);
