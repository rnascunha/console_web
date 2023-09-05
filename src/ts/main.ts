// Importing HTML components
import './web-components/data-display/data-display';
import './web-components/draggable-popup/draggable-popup';
import './web-components/binary-dump/binary-dump';
import './web-components/binary-input/text-binary';
import './web-components/binary-input/text-select-binary';
import './web-components/binary-input/text-area-binary';
import './web-components/binary-input/text-area-radio-binary';
import './web-components/input-file/input-file';
import './web-components/input-dump/input-dump';
import './web-components/calendar/calendar-timestamp';
import './web-components/dropdown-menu/dropdown-menu';
import './web-components/resizeable-container/resizeable-container';
import './web-components/progress-bar';

// Importing style
import '../css/all.css';

// Importing third party library style
import xterm_css from 'xterm/css/xterm.css';
import golden_css from '../css/golden-layout.less';

// Importing app
import type { App } from './apps/app';
import { WSComponent } from './apps/websocket/component';
import { WSApp } from './apps/websocket/app';
import { HTTPComponent } from './apps/http/component';
import { HTTPApp } from './apps/http/app';
import { SerialApp } from './apps/serial/app';
import { is_serial_supported } from './libs/serial/functions';

import { ConsoleApp } from './console_app';
import { InputDumpTool } from './tools/input_dump/tool';
import { TimestampTool } from './tools/timestamp/tool';
import { CoderTool } from './tools/coder/tool';
import { JSONTool } from './tools/json/tool';
import { ESPToolTool } from './tools/esptool/tool';
import { ControlFlowTool } from './tools/control_flow/tool';

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

document.adoptedStyleSheets = [golden_css, xterm_css];

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
  // eslint-disable-next-line no-new
  new ConsoleApp(get_app_list(), [
    new InputDumpTool(),
    new TimestampTool(),
    new CoderTool(),
    new JSONTool(),
    new ESPToolTool(),
    new ControlFlowTool(),
  ]);
}
