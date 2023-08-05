import { type ComponentContainer, type JsonValue } from 'golden-layout';
<<<<<<< HEAD
import { file_to_arraybuffer } from '../../helper/file';
import { ComponentBase } from '../../golden-components/component-base';
import { esp_image } from '../../libs/esp/esp_image_parser';
import { output_image_html as output_image } from './format';
import { read_directory, output_files } from './files';
import { ESPError } from '../../libs/esp/error';
=======
import { ComponentBase } from '../../golden-components/component-base';
import { read_directory, discover_file } from './files';
import { ESPFlashFileList } from './web-components/file-list';
import { ESPError } from '../../libs/esp/error';
import { DataTerminal } from '../../libs/terminal';

import terminal_style from 'xterm/css/xterm.css';
>>>>>>> 1294873 (Backing up.)

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  :host {
    display: flex;
    flex-direction: column;
  }

  #header {
    background-color: grey;
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
  }

  #parser {
    display: inline-flex;
    flex-direction: column;
    gap: 3px;
    overflow: auto;
    flex-grow: 1;
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

<<<<<<< HEAD
=======
  #console {
    height: 100%;
  }

>>>>>>> 1294873 (Backing up.)
  </style>
  <div id=header>
    <input-file id=esp-file accept='.bin' class=header-icon><span>✚</span></input-file>
    <input-file id=esp-folder class=header-icon webkitdirectory><span>&#x1F4C2;</span></input-file>
    <span id=error></span>
  </div>
<<<<<<< HEAD
  <div id=parser></div>`;
=======
  <div id=container>
    <div id=parser></div>
    <div id=console></div>
  </div>`;
>>>>>>> 1294873 (Backing up.)
  return template;
})();

function error_message(err: ESPError): string {
  return `[${err.code}] ${err.message} [${err.args.toString() as string}]`;
}

export class ESP32ParserComponent extends ComponentBase {
  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'ESP32 Parser';

<<<<<<< HEAD
    // const opt = state as CoderOptions;

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    const parser = shadow.querySelector('#parser') as HTMLElement;
=======
    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    shadow.adoptedStyleSheets = [terminal_style];

    const parser = shadow.querySelector('#parser') as HTMLElement;
    const terminal = new DataTerminal(
      shadow.querySelector('#console') as HTMLElement
    );
    terminal.write(new TextEncoder().encode('teste\r\n'));

>>>>>>> 1294873 (Backing up.)
    const error = shadow.querySelector('#error') as HTMLElement;
    customElements
      .whenDefined('input-file')
      .then(() => {
        const input = shadow.querySelector('#esp-file') as InputFile;
<<<<<<< HEAD
        input.on('change', () => {
          const files = input.files as FileList;

          if (files.length > 0) {
            const file = (input.files as FileList)[0];
            file_to_arraybuffer(file)
              .then(async data => {
                const d = await esp_image(data);
                parser.appendChild(output_image(file, d));
                error.textContent = '';
              })
              .catch(err => {
                if (err instanceof ESPError)
                  error.textContent = error_message(err);
                else console.log(err);
              });
          }
=======
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
>>>>>>> 1294873 (Backing up.)
        });
        const folder = shadow.querySelector('#esp-folder') as InputFile;
        folder.on('change', async () => {
          try {
            if (folder.files === null) return;
            const data = await read_directory(folder.files);
<<<<<<< HEAD
            parser.appendChild(output_files(data));
=======
            parser.appendChild(new ESPFlashFileList(data));
>>>>>>> 1294873 (Backing up.)
            error.textContent = '';
          } catch (err) {
            if (err instanceof ESPError) error.textContent = error_message(err);
            else console.log(err);
          }
<<<<<<< HEAD
=======
          folder.value = '';
>>>>>>> 1294873 (Backing up.)
        });
      })
      .finally(() => {});
  }
}
