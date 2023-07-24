import { DraggablePopup } from '../web-components/draggable-popup/draggable-popup';

interface WindowOptions {
  hide_undock?: boolean;
  append?: boolean;
  center?: boolean;
}

export function create_window(
  title: string,
  body: HTMLElement,
  options: WindowOptions = {}
): DraggablePopup {
  const dp = new DraggablePopup();
  dp.classList.add('window');

  const header = document.createElement('div');
  header.slot = 'header';
  header.classList.add('window-header');
  header.textContent = title;

  dp.appendChild(header);

  const resizer = document.createElement('resizeable-container');
  body.classList.add('window-body');
  resizer.appendChild(body);
  dp.appendChild(resizer);

  // body.classList.add('window-body');
  // dp.appendChild(body);

  if (options?.hide_undock === true) {
    dp.hide_undock();
  }

  if (options?.append === true) {
    document.body.appendChild(dp);
    if (options?.center === true) dp.center();
  }

  return dp;
}
