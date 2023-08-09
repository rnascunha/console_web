import type { ESPFlashFile } from '../types';
import { ESPFlashFileElement } from './file';
import { output_file } from '../parse';
import { discover_file } from '../files';
import { is_serial_supported } from '../../../apps/serial/functions';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: 3px;
      width: 100%;
      max-width: 600px;
      padding: 3px;
      border: 2px solid white;
      border-radius: 3px;
      color: white;
    }

    #container {
      display: flex;
      flex-direction: column;
    }
    
    .selected {
      font-weight: bold;
    }

    #execute {
      display: flex;
      justify-content: flex-end;
      gap: 2px;
    }

    #progress {
      width: 100%;
      box-sizing: border-box;
      background-color: grey;
      padding: 3px;
      border-radius: 3px;
      text-align: center;
    }

    .parser-content {
      display: inline-flex;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .parser-container {
      border-radius: 3px;
    }

    .disable {
      cursor: not-allowed;
    }

    label {
      user-select: none;
    }

    button {
      cursor: pointer;
    }
  </style>
  <div id=header>
    <input-file id=add-file title="Add file"><button>✚</button></input-file>
    <button id=close title="Add file">✖</button>
  </div>
  <div id=container></div>
  <div id=execute>
    <label><input id=verify type=checkbox checked />Verify</label>
    <label><input id=monitor type=checkbox checked />Monitor</label>
    <button class=flash-btn title="Upload selected">Selected ▶</button>
    <button class=flash-btn title="Upload all">All ▶</button>
  </div>
  <div id=progress>Progress</div>
  <span id=parsed></span>`;

  if (!is_serial_supported()) {
    template.content.querySelectorAll('.flash-btn').forEach(b => {
      const btn = b as HTMLButtonElement;
      btn.title = 'Serial API not supported';
      btn.classList.add('disable');
      btn.disabled = true;
    });
  }

  return template;
})();

export class ESPFlashFileList extends HTMLElement {
  private _files: ESPFlashFile[];
  constructor(files: ESPFlashFile[]) {
    super();

    this._files = files;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    shadow.querySelector('#close')?.addEventListener('click', () => {
      this.close();
    });

    const container = shadow.querySelector('#container') as HTMLElement;
    files.forEach(file => {
      container.appendChild(new ESPFlashFileElement(file));
    });

    container.addEventListener('delete', ev => {
      const file = (ev as CustomEvent).detail as ESPFlashFile;
      this._files = this._files.filter(f => f.file !== file.file);
      if (this._files.length === 0) this.close();
    });

    const parsed = shadow.querySelector('#parsed') as HTMLElement;
    container.addEventListener('parse', ev => {
      this.show_parse(
        ev.target as HTMLElement,
        parsed,
        container,
        (ev as CustomEvent).detail as ESPFlashFile
      );
    });

    customElements
      .whenDefined('input-file')
      .then(() => {
        const input = shadow.querySelector('#add-file') as InputFile;
        input.on('change', async ev => {
          const files = input.files as FileList;
          if (files.length === 0) return;
          try {
            const file = (input.files as FileList)[0];
            const esp_file = await discover_file(file);
            container.appendChild(new ESPFlashFileElement(esp_file));
          } catch (err) {
            console.log(err);
          }
          input.value = '';
        });
      })
      .finally(() => {});
  }

  private close(): void {
    this.parentElement?.removeChild(this);
  }

  private show_parse(
    target: HTMLElement,
    parsed_container: HTMLElement,
    container: HTMLElement,
    file: ESPFlashFile
  ): void {
    parsed_container.innerHTML = '';
    if (target.classList.contains('selected')) {
      target.classList.remove('selected');
      return;
    }
    for (let i = 0; i < container.children.length; ++i)
      container.children[i].classList.remove('selected');
    target.classList.add('selected');
    output_file(file)
      .then(el => {
        parsed_container.appendChild(el);
      })
      .finally(() => {});
  }
}

customElements.define('esp-file-list', ESPFlashFileList);
