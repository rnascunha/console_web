import type { ESPFlashFile } from '../types';
import { ESPFlashFileElement } from './file';
import { output_file } from '../parse';

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

    label {
      user-select: none;
    }

    button {
      cursor: pointer;
    }
  </style>
  <div id=header>
    <button id=add-file title="Add file">✚</button>
    <button id=close title="Add file">✖</button>
  </div>
  <div id=container></div>
  <div id=execute>
    <label><input id=verify type=checkbox checked />Verify</label>
    <label><input id=monitor type=checkbox checked />Monitor</label>
    <button title="Upload selected">Selected ▶</button>
    <button title="Upload all">All ▶</button>
  </div>
  <div id=progress>Progress</div>
  <span id=parsed></span>`;

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
      output_file((ev as CustomEvent).detail as ESPFlashFile)
        .then(el => {
          parsed.innerHTML = '';
          parsed.appendChild(el);
        })
        .finally(() => {});
    });
  }

  private close(): void {
    this.parentElement?.removeChild(this);
  }
}

customElements.define('esp-file-list', ESPFlashFileList);
