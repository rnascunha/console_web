/**
 * https://htmldom.dev/make-a-resizable-element/
 */

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }

    ::slotted(*) {
      height: 100%;
    }

    .resizer {
      position: absolute;
    }

    .resizer-r {
      cursor: col-resize;
      height: 100%;
      right: 0;
      top: 0;
      width: 5px;
    }

    .resizer-b {
      cursor: row-resize;
      width: 100%;
      left: 0;
      bottom: 0;
      height: 5px;
    }
  </style>
  <slot></slot>
  <div class="resizer resizer-r"></div>
  <div class="resizer resizer-b"></div>`;

  return template;
})();

export class ResizeableContainer extends HTMLElement {
  private _x: number = 0;
  private _y: number = 0;

  private _w: number = 0;
  private _h: number = 0;

  private _move_handler: (ev: MouseEvent) => void;
  private readonly _up_handler: () => void;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    shadow.querySelector('.resizer-r')?.addEventListener('mousedown', ev => {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      this._move_handler = (e: MouseEvent) => {
        this.on_move_h(e);
      };
      this.on_down(ev as MouseEvent);
    });

    shadow.querySelector('.resizer-b')?.addEventListener('mousedown', ev => {
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      this._move_handler = (e: MouseEvent) => {
        this.on_move_v(e);
      };
      this.on_down(ev as MouseEvent);
    });

    this._move_handler = (ev: MouseEvent) => {
      this.on_move_h(ev);
      this.on_move_v(ev);
    };
    this._up_handler = () => {
      this.on_up();
    };
  }

  private on_down(ev: MouseEvent): void {
    this._x = ev.clientX;
    this._y = ev.clientY;

    const styles = window.getComputedStyle(this);
    this._w = parseInt(styles.width, 10);
    this._h = parseInt(styles.height, 10);

    document.addEventListener('mousemove', this._move_handler);
    document.addEventListener('mouseup', this._up_handler);
  }

  private on_move_h(ev: MouseEvent): void {
    const dx = ev.clientX - this._x;
    this.style.width = `${this._w + dx}px`;
  }

  private on_move_v(ev: MouseEvent): void {
    const dy = ev.clientY - this._y;
    this.style.height = `${this._h + dy}px`;
  }

  private on_up(): void {
    document.removeEventListener('mousemove', this._move_handler);
    document.removeEventListener('mouseup', this._up_handler);

    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
  }
}

customElements.define('resizeable-container', ResizeableContainer);
