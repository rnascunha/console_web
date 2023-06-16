// Importing HTML components
import './components/data-display/data-display';
import './components/draggable-popup/draggable-popup';
import './components/binary-dump/binary-dump';

// Importing style
import '../css/style.css';
import '../css/serial.css';
import '../css/window.css';

// Importing third party library style
import '../../node_modules/xterm/css/xterm.css';
import '../css/golden-layout.less';

// Importing app
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
