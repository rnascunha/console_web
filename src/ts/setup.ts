import { create_window } from './helper/window';

document.querySelector('#setup')?.addEventListener('click', () => {
  const body = document.createElement('div');
  body.innerHTML = `Version: <b>${__COMMIT_HASH__}</b>`;
  body.classList.add('setup-body');
  create_window('Setup', body, {
    hide_undock: true,
    append: true,
    center: true,
  });
});
