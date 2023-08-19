const default_bg = '#999999';
const default_bar = '#00cc00';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: flex;
      justify-content: center;
      padding: 3px;
      border-radius: 3px;
      color: white;
    }
  </style>
  <slot>Progress Bar</slot>`;

  return template;
})();

export class ProgressBar extends HTMLElement {
  private _bg: string = default_bg;
  private _barc: string = default_bar;
  private _value: number = 0;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }

  public connectedCallback(): void {
    this._bg = this.getAttribute('bg') ?? this._bg;
    this._barc = this.getAttribute('bar') ?? this._barc;
    if (this.hasAttribute('value'))
      this._value = parseInt(this.getAttribute('value') as string);

    this.update_view();
  }

  set text(title: string) {
    this.textContent = title;
  }

  get text(): string {
    return (
      (this.shadowRoot?.querySelector('slot') as HTMLElement).textContent ?? ''
    );
  }

  set value(val: number) {
    val = Math.min(val, 100);
    val = Math.max(val, 0);
    this._value = val;
    this.update_view();
  }

  get value(): number {
    return this._value;
  }

  set bg_color(color: string) {
    this._bg = color;
    this.update_view();
  }

  get bg_color(): string {
    return this._bg;
  }

  set bar_color(color: string) {
    this._barc = color;
    this.update_view();
  }

  get bar_color(): string {
    return this._barc;
  }

  private update_view(): void {
    // this.style.background = this._bg;
    // this.style.backgroundImage = `linear-gradient(90deg, ${this._barc} ${this._value}%)`;
    this.style.backgroundImage = `linear-gradient(to right, ${this._barc} 0%, ${this._barc} ${this._value}%, ${this._bg} ${this._value}%, ${this._bg} 100%)`;
  }
}

customElements.define('progress-bar', ProgressBar);
