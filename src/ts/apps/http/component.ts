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

    const data = JSON.parse(state as string);
    this._view = new HTTPView(data.url, data.state);
    this.rootHtmlElement.appendChild(this._view.container);

    this._view.on('state', args => {
      window.console_app.set_state(data.url.split('://')[0], args);
    });

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
