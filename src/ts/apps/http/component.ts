import { AppComponent } from '../../golden-components/component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';
import { HTTPView } from './http';

export class HTTPComponent extends AppComponent {
  private readonly _view: HTTPView;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this._view = new HTTPView(state as string); // url
    this.rootHtmlElement.appendChild(this._view.container);

    this.container.setTitle(`${this._view.url}`);
    if (this.container.layoutManager.isSubWindow)
      window.document.title = this.container.title;
  }

  public is_reusable(url: string): boolean {
    return url === this._view.url;
  }

  public reused(url: string): boolean {
    if (url !== this._view.url) return false;

    this.container.focus();
    return true;
  }
}
