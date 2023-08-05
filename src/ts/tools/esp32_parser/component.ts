import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { file_to_arraybuffer } from '../../helper/file';
import { ComponentBase } from '../../golden-components/component-base';
import { esp_image } from '../../libs/esp/esp_image_parser';
import { output_image_html as output_image } from './format';
import { read_directory, output_files } from './files';
import { ESPError } from '../../libs/esp/error';

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

  #parser {
    flex-grow: 1;
  }

  .parser-container {
    color: white;
    display: inline-block;
    border-radius: 5px;
  }

  .parser-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
    height: 134px;
    align-content: baseline;
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

  </style>
  <div id=header>
    <input-file id=esp-file accept='.bin' class=header-icon><span>✚</span></input-file>
    <input-file id=esp-folder class=header-icon webkitdirectory><span>&#x1F4C2;</span></input-file>
    <span id=error></span>
  </div>
  <div id=parser></div>`;
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

    // const opt = state as CoderOptions;

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    const parser = shadow.querySelector('#parser') as HTMLElement;
    const error = shadow.querySelector('#error') as HTMLElement;
    customElements
      .whenDefined('input-file')
      .then(() => {
        const input = shadow.querySelector('#esp-file') as InputFile;
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
        });
        const folder = shadow.querySelector('#esp-folder') as InputFile;
        folder.on('change', async () => {
          try {
            if (folder.files === null) return;
            const data = await read_directory(folder.files);
            parser.appendChild(output_files(data));
            error.textContent = '';
          } catch (err) {
            if (err instanceof ESPError) error.textContent = error_message(err);
            else console.log(err);
          }
        });
      })
      .finally(() => {});
  }
}
