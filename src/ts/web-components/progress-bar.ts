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
      align-items: center;
      --bg-color: #999999;
      --bar-color: #00cc00;
    }
  </style>
  <slot>Progress Bar</slot>`;

  return template;
})();

export class ProgressBar extends HTMLElement {
  private _value: number = 0;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }

  public connectedCallback(): void {
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
    this.style.setProperty('--bg-color', color);
    this.update_view();
  }

  get bg_color(): string {
    return getComputedStyle(this).getPropertyValue('--bg-color');
  }

  set bar_color(color: string) {
    this.style.setProperty('--bar-color', color);
    this.update_view();
  }

  get bar_color(): string {
    return getComputedStyle(this).getPropertyValue('--bar-color');
  }

  private update_view(): void {
    this.style.backgroundImage = `linear-gradient(to right, ${this.bar_color} 0%, ${this.bar_color} ${this._value}%, ${this.bg_color} ${this._value}%, ${this.bg_color} 100%)`;
  }
}

customElements.define('progress-bar', ProgressBar);
