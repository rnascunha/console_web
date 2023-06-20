import type { GoldenLayout, ComponentContainer } from 'golden-layout';

interface ConnectComponent {
  reused: (url: string) => boolean;
}

export abstract class ComponentBase implements GoldenLayout.VirtuableComponent {
  private readonly _container: ComponentContainer;
  private readonly _root_element: HTMLElement;

  get container(): ComponentContainer {
    return this._container;
  }

  get rootHtmlElement(): HTMLElement {
    return this._root_element;
  }

  constructor(container: ComponentContainer, virtual: boolean) {
    this._container = container;
    if (virtual) {
      this._root_element = document.createElement('div');
      this._root_element.style.position = 'absolute';
      this._root_element.style.overflow = 'hidden';
    } else {
      this._root_element = this._container.element;
    }
  }
}

export abstract class AppComponent
  extends ComponentBase
  implements ConnectComponent
{
  public abstract reused(url: string): boolean;
}
