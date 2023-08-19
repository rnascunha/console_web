import '../../../web-components/progress-bar';

import { ProgressBar } from '../../../web-components/progress-bar';
import type { ESPFlashFile } from '../types';
import { ESPFlashFileElement } from './file';
import { output_file } from '../parse';
import { discover_file } from '../files';
import { is_serial_supported } from '../../../libs/serial/functions';

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
      box-sizing: border-box;
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

    #progress {
      font-weight: bold;
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
    <div id=error></div>
    <label><input id=verify type=checkbox checked />Verify</label>
    <label><input id=monitor type=checkbox checked />Monitor</label>
    <button id=flash-selected class=flash-btn title="Upload selected">Selected ▶</button>
    <button id=flash-all class=flash-btn title="Upload all">All ▶</button>
  </div>
  <progress-bar id=progress>Progress</progress-bar>
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

export interface FlashFlags {
  verify: boolean;
  monitor: boolean;
}

export interface ESPFlashFileListState {
  files: ESPFlashFile[];
  flags: FlashFlags;
}

export class ESPFlashFileList extends HTMLElement {
  private readonly _error: HTMLElement;
  private readonly _progress: ProgressBar;

  constructor(files: ESPFlashFile[], flags?: FlashFlags) {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._error = shadow.querySelector('#error') as HTMLElement;
    this._progress = shadow.querySelector('#progress') as ProgressBar;

    // Monitor
    const monitor = shadow.querySelector('#monitor') as HTMLInputElement;
    monitor.addEventListener('change', () => {
      this.dispatchEvent(new Event('state', { bubbles: true }));
    });
    if (flags?.monitor === false) monitor.checked = false;

    // Verify
    const verify = shadow.querySelector('#verify') as HTMLInputElement;
    verify.addEventListener('change', () => {
      this.dispatchEvent(new Event('state', { bubbles: true }));
    });
    if (flags?.verify === false) verify.checked = false;

    if (is_serial_supported()) {
      shadow.querySelector('#flash-all')?.addEventListener('click', () => {
        const files = Array.from(shadow.querySelectorAll('esp-flash-file')).map(
          f => (f as ESPFlashFileElement).file
        );
        this.dispatchEvent(
          new CustomEvent('flash', {
            detail: files,
            bubbles: true,
          })
        );
      });

      shadow.querySelector('#flash-selected')?.addEventListener('click', () => {
        const files = Array.from(shadow.querySelectorAll('esp-flash-file'))
          .filter(f => (f as ESPFlashFileElement).file.select)
          .map(f => (f as ESPFlashFileElement).file);
        this.dispatchEvent(
          new CustomEvent('flash', {
            detail: files,
            bubbles: true,
          })
        );
      });

      shadow.addEventListener('flash', ev => {
        this.dispatchEvent(
          new CustomEvent('flash', {
            detail: [(ev.target as ESPFlashFileElement).file],
            bubbles: true,
          })
        );
      });

      shadow.addEventListener('state', ev => {
        this.dispatchEvent(new Event('state', { bubbles: true }));
      });
    }

    const container = shadow.querySelector('#container') as HTMLElement;
    files.forEach(file => {
      container.appendChild(new ESPFlashFileElement(file));
    });

    shadow.querySelector('#close')?.addEventListener('click', () => {
      while (container.lastChild !== null)
        container.removeChild(container.lastChild);
      this.dispatchEvent(new Event('delete', { bubbles: true }));
    });

    container.addEventListener('delete', ev => {
      container.removeChild(ev.target as HTMLElement);
      this.dispatchEvent(new Event('delete', { bubbles: true }));
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

  public error(message: string): void {
    this._error.textContent = message;
  }

  public progress(config: {
    value?: number;
    text?: string;
    bar?: string;
    bg?: string;
  }): void {
    if (config.value !== undefined) this._progress.value = config.value;
    if (config.text !== undefined) this._progress.text = config.text;
    if (config.bar !== undefined) this._progress.bar_color = config.bar;
    if (config.bg !== undefined) this._progress.bg_color = config.bg;
  }

  get flags(): FlashFlags {
    const shadow = this.shadowRoot as ShadowRoot;
    return {
      verify: (shadow.querySelector('#verify') as HTMLInputElement).checked,
      monitor: (shadow.querySelector('#monitor') as HTMLInputElement).checked,
    };
  }

  get state(): ESPFlashFileListState {
    return {
      flags: this.flags,
      files: this.files,
    };
  }

  get files(): ESPFlashFile[] {
    const shadow = this.shadowRoot as ShadowRoot;
    return Array.from(shadow.querySelectorAll('esp-flash-file')).map(
      f => (f as ESPFlashFileElement).file
    );
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
