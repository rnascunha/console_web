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
import { type App } from './apps/app';
import { WSComponent } from './apps/websocket/component';
import { WSApp } from './apps/websocket/app';
import { HTTPComponent } from './apps/http/component';
import { HTTPApp } from './apps/http/app';
import { SerialApp } from './apps/serial/app';
import { is_serial_supported } from './apps/serial/functions';

import { ConsoleApp } from './console_app';
import './setup';

declare global {
  const __COMMIT_HASH__: string; // eslint-disable-line
  interface Window {
    console_app: ConsoleApp;
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

function is_secure_connection(): boolean {
  return window.location.protocol === 'https:';
}

function get_app_list(): App[] {
  const apps: App[] = [];
  if (!is_secure_connection()) apps.push(new WSApp('ws', WSComponent));
  apps.push(new WSApp('wss', WSComponent));
  if (!is_secure_connection()) apps.push(new HTTPApp('http', HTTPComponent));
  apps.push(new HTTPApp('https', HTTPComponent));
  if (is_serial_supported()) apps.push(new SerialApp());
  return apps;
}

function run(): void {
  new ConsoleApp(get_app_list()); // eslint-disable-line no-new
}
