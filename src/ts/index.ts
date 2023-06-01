import './components/data-display/data-display'
import '../css/style.css';
import '../css/serial.css';
import '../css/golden-layout.less';

import {App} from './app';

declare global {
  interface Window {
    console_app: App;
  }
}


if (document.readyState !== "loading") run();
else document.addEventListener("DOMContentLoaded", () => run(), { passive: true });

function run() {
  window.console_app = new App();
}

