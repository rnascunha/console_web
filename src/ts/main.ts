import './components/data-display/data-display';
import './components/draggable-popup/draggable-popup';
import './components/binary-dump/binary-dump';

import '../css/style.css';
import '../css/serial.css';
import '../css/window.css';

import '../../node_modules/xterm/css/xterm.css';
import '../css/golden-layout.less';

import { App } from './app';

declare global {
  interface Window {
    console_app: App;
  }
}

if (document.readyState !== 'loading') run();
else
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      run();
    },
    { passive: true }
  );

function run(): void {
  // eslint-disable-next-line no-new
  new App();
}
