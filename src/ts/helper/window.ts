import { DraggablePopup } from '../web-components/draggable-popup/draggable-popup';

export function create_window(
  title: string,
  body: HTMLElement
): DraggablePopup {
  const dp = new DraggablePopup();
  dp.classList.add('window');

  const header = document.createElement('div');
  header.slot = 'header';
  header.classList.add('window-header');
  header.textContent = title;

  dp.appendChild(header);

  body.classList.add('window-body');
  dp.appendChild(body);

  return dp;
}
