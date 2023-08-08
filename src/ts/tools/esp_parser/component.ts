import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import { read_directory, discover_file } from './files';
import { ESPFlashFileList } from './web-components/file-list';
import { ESPError } from '../../libs/esp/error';
import { DataTerminal } from '../../libs/terminal';
import { is_serial_supported } from '../../apps/serial/functions';

import terminal_style from 'xterm/css/xterm.css';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  #header {
    background-color: grey;
    padding: 2px 3px;
    margin-bottom: 3px;
  }

  .header-icon {
    --cursor-input: pointer;
    padding: 2px;
    border-radius: 2px;
    color: white;
  }

  .header-icon:hover {
    background-color: black;
  }

  #container {
    flex-grow: 1;
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  #parser {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
    overflow: auto;
  }

  #error {
    display: inline-block;
    background-color: red;
    color: white;
    padding: 2px;
    border-radius: 2px;
  }

  #error:empty {
    display: none;
  }

  #console {
    height: 100%;
  }

  </style>
  <div id=header>
    <input-file id=esp-file accept='.bin' class=header-icon><span>✚</span></input-file>
    <input-file id=esp-folder class=header-icon webkitdirectory><span>&#x1F4C2;</span></input-file>
    <span id=error></span>
  </div>
  <div id=container>
    <div id=parser></div>
    <div id=console></div>
  </div>`;
  return template;
})();

function error_message(err: ESPError): string {
  return `[${err.code}] ${err.message} [${err.args.toString() as string}]`;
}

export class ESPParserComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'ESP Parser';

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    shadow.adoptedStyleSheets = [terminal_style];

    const parser = shadow.querySelector('#parser') as HTMLElement;
    const terminal = new DataTerminal(
      shadow.querySelector('#console') as HTMLElement
    );
    if (is_serial_supported()) {
      terminal.write_str('ESPTool Flash\r\n');
    } else {
      terminal.write_str('ESPTool Flash\r\n');
      terminal.write_str(
        'Serial API is not supported at this browser! Use a chrome based browser.\r\n'
      );
      terminal.write_str('https://caniuse.com/web-serial\r\n');
    }

    this.container.on('resize', () => {
      terminal.fit();
    });

    const error = shadow.querySelector('#error') as HTMLElement;
    customElements
      .whenDefined('input-file')
      .then(() => {
        const input = shadow.querySelector('#esp-file') as InputFile;
        input.on('change', async () => {
          const files = input.files as FileList;
          if (files.length === 0) return;

          try {
            const file = (input.files as FileList)[0];
            const esp_file = await discover_file(file);
            parser.appendChild(new ESPFlashFileList([esp_file]));
            error.textContent = '';
          } catch (err) {
            if (err instanceof ESPError) error.textContent = error_message(err);
            else console.log(err);
          }
          input.value = '';
        });
        const folder = shadow.querySelector('#esp-folder') as InputFile;
        folder.on('change', async () => {
          try {
            if (folder.files === null) return;

            const data = await read_directory(folder.files);
            parser.appendChild(new ESPFlashFileList(data));
            error.textContent = '';
          } catch (err) {
            if (err instanceof ESPError) error.textContent = error_message(err);
            else console.log(err);
          }
          folder.value = '';
        });
      })
      .finally(() => {});
  }
}
