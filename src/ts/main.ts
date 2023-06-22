// Importing HTML components
import './web-components/data-display/data-display';
import './web-components/draggable-popup/draggable-popup';
import './web-components/binary-dump/binary-dump';
import './web-components/binary-input/text-binary';
import './web-components/binary-input/text-select-binary';

// Importing style
import '../css/style.css';
import '../css/serial.css';
import '../css/window.css';

// Importing third party library style
import '../../node_modules/xterm/css/xterm.css';
import '../css/golden-layout.less';

// Importing app
import { App } from './app';
import './setup';

declare global {
  const __COMMIT_HASH__: string; // eslint-disable-line
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
  new App(); // eslint-disable-line no-new
}
