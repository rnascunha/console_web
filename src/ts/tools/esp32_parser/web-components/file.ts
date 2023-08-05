import type { ESPFlashFile } from '../files';

const template = (function () {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      color: white;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      padding: 3px;
      margin: 1px;
      border: 1px solid white;
      border-radius: 3px;
    }

    .field {
      padding: 0px 2px;
    }

    .hover {
      cursor: pointer;
    }

    .hover:hover {
      background-color: white;
      color: black;
    }

    #file {
      flex-grow: 1;
      text-align: center;
    }

    #offset {
      width: 8ch;
      outline: none;
      text-align: center;
      background-color: transparent;
      color: white;
    }
  </style>
  <span id=delete class="field hover" title=Delete>✖</span>
  <input type=checkbox id=selected class="field" checked />
  <span id=file></span>
  <input id=offset class=field />
  <span id=flash class="field hover" title=Upload>▶</span>`;
  return template;
})();

export class ESPFlashFileElement extends HTMLElement {
  constructor(file: ESPFlashFile) {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    const file_el = shadow.querySelector('#file') as HTMLElement;
    file_el.textContent = file.name;

    const offset_el = shadow.querySelector('#offset') as HTMLInputElement;
    offset_el.value = file.offset;

    shadow.querySelector('#delete')?.addEventListener('click', () => {
      this.parentElement?.removeChild(this);
      this.dispatchEvent(
        new CustomEvent('delete', {
          detail: file,
          bubbles: true,
        })
      );
    });

    shadow.querySelector('#flash')?.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('flash', {
          detail: file,
          bubbles: true,
        })
      );
    });
  }
}

customElements.define('esp-flash-file', ESPFlashFileElement);
