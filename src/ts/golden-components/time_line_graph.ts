import { ComponentBase } from './component-base';
import type { ComponentContainer, JsonValue } from 'golden-layout';

export class TimeLineGraphComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.container.setTitle('TimeLineGraph');
    if (this.container.layoutManager.isSubWindow) {
      window.document.title = 'Time Line Graph';
    }

    this.rootHtmlElement.style.overflow = 'auto';
    this.rootHtmlElement.style.height = '100%';
  }
}
