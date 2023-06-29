import { create_window } from './helper/window';
import type { DraggablePopup } from './web-components/draggable-popup/draggable-popup';
import type { DB } from './libs/db';
import { GoldenLayout } from 'golden-layout';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <div>
    <button class=delete-db>Erase DB</button>
  </div>
  <div class=info></div>
  <div>
    <small>Version: <b>${__COMMIT_HASH__}</b></small>
  </div>`;
  return template;
})();

export function dispatch_setup(db: DB): DraggablePopup {
  const body = document.createElement('div');
  body.appendChild(template.content.cloneNode(true));
  body.classList.add('setup-body');

  body.querySelector('.delete-db')?.addEventListener('click', () => {
    const info = body.querySelector('.info') as HTMLElement;
    db.clear(true)
      .then(() => {
        info.textContent = 'Database delete';
      })
      .catch(e => {
        info.textContent = (e as Error).message;
      });
  });

  return create_window('Setup', body, {
    hide_undock: true,
    append: true,
    center: true,
  });
}

export function dispatch_tool(layout: GoldenLayout): void {
  document.querySelector('#tools')?.addEventListener('click', () => {
    layout.addComponent(
      'InputDockDumpComponent',
      JSON.stringify({ data: '', breakline: 8, hide: [] })
    );
  });
}
