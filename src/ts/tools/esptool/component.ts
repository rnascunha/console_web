import { type ComponentContainer, type JsonValue } from 'golden-layout';
import { ComponentBase } from '../../golden-components/component-base';
import { read_directory, discover_file } from './files';
import {
  ESPFlashFileList,
  type ESPFlashFileListState,
  type FlashFlags,
} from './web-components/file-list';
import { ESPError } from '../../libs/esptool.ts/error';
import { DataTerminal, Color } from '../../libs/terminal';
import { ConsoleApp } from '../../console_app';
import type { SerialConn } from '../../libs/serial/serial';
import {
  install_serial_events,
  is_serial_supported,
} from '../../libs/serial/functions';
import { serialBaudrate } from '../../libs/serial/constants';
import { ESPLoader } from '../../libs/esptool.ts/loader/loader';
import { chip_name, mac_string } from '../../libs/esptool.ts/loader/debug';
import { type FlashImageProgress } from '../../libs/esptool.ts/loader/types';
import {
  compression_support,
  compress_image,
} from '../../libs/esptool.ts/utility';
import type { ESPFlashFile } from './types';
import { file_to_arraybuffer } from '../../helper/file';

import { ArrayBuffer as md5_digest } from 'spark-md5';

import terminal_style from 'xterm/css/xterm.css';

const template = (function () {
  const default_baudrate = 115200;

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
    gap: 2px;
  }

  #parser {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    flex: 1 1 auto;
    overflow: auto;
    width: 100%;
    min-width: 300px;
    max-width: 600px;
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

  #serial {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  #serial-header {
    margin-bottom: 2px;
  }

  #serial-select {
    max-width: 230px;
    text-overflow: ellipsis;
    overflow-wrap: break-word;
  }

  #serial-open[data-state=open]::after {
    content: '✖';
  }

  #serial-open[data-state=close]::after {
    content: '▶';
  }

  #console {
    flex-grow: 1;
  }

  #bootloader-debug {
    display: inline-flex;
    gap: 2px;
    position: absolute;
    right: 2px;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

  </style>
  <div id=header>
    <input-file id=esp-file accept='.bin' class=header-icon><span>✚</span></input-file>
    <input-file id=esp-folder class=header-icon webkitdirectory><span>&#x1F4C2;</span></input-file>
    <span id=error></span>
  </div>
  <div id=container>
    <div id=parser></div>
    <div id=serial>
      <div id=serial-header>
        <select id=serial-select></select>
        <button id=serial-request>&#x1F504;</button>
        <input id=serial-baudrate type=number list=serial-baudrate-list style=width:10ch value=${default_baudrate} title=Baudrate />
        <datalist id=serial-baudrate-list></datalist>
        <button id=serial-open data-state=close></button>
        <button id=serial-reset>Reset</button>
        <button id=serial-erase-flash title='Erase flash'>&#x2327;</button>
        <button id=serial-terminal-clear title=clear>&#x239A;</button>
        <div id=bootloader-debug>
          <button id=serial-bootloader>BOOT</button>
          <button id=serial-sync title=Sync>&#x21B9;</button>
          <button id=serial-chip title='Chip information'>&#x2139;</button>
          <button id=serial-change-baud title='Change Baudrate'>BR</button>
          <button id=serial-upload-stub title='Upload stub'>&#x26F0</button>
        </div>
      </div>
      <div id=console></div>
    </div>
  </div>`;

  const br_list = template.content.querySelector(
    '#serial-baudrate-list'
  ) as HTMLDataListElement;
  serialBaudrate.forEach(br => {
    br_list.appendChild(new Option(br.toString(), br.toString()));
  });

  return template;
})();

function hex(val: number, pad_size: number = 2): string {
  return val.toString(16).padStart(pad_size, '0');
}

function error_message(err: ESPError): string {
  return `[${err.code}] ${err.message} [${err.args.toString() as string}]`;
}

enum ESPToolState {
  CLOSE,
  OPEN,
  BOOTLOADER,
  SYNC,
  STUB,
}

const bg_color = '#999999';
const bar_color = '#00cc00';

const color_ok = { colors: [Color.FG_GREEN] };
const color_fail = { colors: [Color.FG_RED] };
const color_warn = { colors: [Color.FG_YELLOW] };

function reset_file_list(list: ESPFlashFileList): void {
  list.error('');
  list.progress({ value: 0, text: '0/0', bar: bar_color, bg: bg_color });
}

export class ESPToolComponent extends ComponentBase {
  private _loader?: ESPLoader;
  private readonly _terminal: DataTerminal;
  private _state: ESPToolState = ESPToolState.CLOSE;

  constructor(
    container: ComponentContainer,
    state: JsonValue | undefined,
    virtual: boolean
  ) {
    super(container, virtual);

    this.title = 'ESPTool';

    const sstate = window.console_app.get_tool_state('esptool');

    const shadow = this.rootHtmlElement.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this._terminal = new DataTerminal();

    this.console();
    this.parser(sstate.list);

    shadow.addEventListener('state', ev => {
      this.save_state();
    });
  }

  private parser(lists: ESPFlashFileListState[]): void {
    const shadow = this.rootHtmlElement.shadowRoot as ShadowRoot;
    const parser = shadow.querySelector('#parser') as HTMLElement;
    const error = shadow.querySelector('#error') as HTMLElement;

    if (lists !== undefined)
      lists.forEach(list => {
        parser.appendChild(new ESPFlashFileList(list.files, list.flags));
      });

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
          this.save_state();
          input.value = '';
        });
        const folder = shadow.querySelector('#esp-folder') as InputFile;
        folder.on('change', async () => {
          try {
            if (folder.files === null) return;

            const data = await read_directory(folder.files);
            const file_list = new ESPFlashFileList(data);
            parser.appendChild(file_list);
            this.save_state();
            error.textContent = '';
          } catch (err) {
            if (err instanceof ESPError) error.textContent = error_message(err);
            else console.log(err);
          }
          folder.value = '';
        });
      })
      .finally(() => {});

    shadow.addEventListener('flash', ev => {
      const file_list = ev.target as ESPFlashFileList;
      if (this._state < ESPToolState.SYNC) {
        file_list.error('ESPTool not synced');
        return;
      }
      const files = (ev as CustomEvent).detail as ESPFlashFile[];
      this.flash_image(file_list, files).finally(() => {});
    });

    shadow.addEventListener('delete', ev => {
      const list = ev.target as ESPFlashFileList;
      if (list.files.length === 0) parser.removeChild(list);
      this.save_state();
    });
  }

  private async flash_image(
    file_list: ESPFlashFileList,
    files: ESPFlashFile[]
  ): Promise<void> {
    reset_file_list(file_list);
    try {
      await flash_files(
        this._loader as ESPLoader,
        files,
        this._terminal,
        (file: string, data: FlashImageProgress) => {
          file_list.progress({
            value: data.percent,
            text: `${file} ${data.seq}/${data.blocks}`,
          });
          this._terminal.write_str(
            `\r${data.seq}/${data.blocks}|${data.written}/${data.file_size}...${data.percent}%`.padEnd(
              this._terminal.terminal.cols - 1,
              ' '
            ),
            { bl: false }
          );
        },
        file_list.flags
      );
      file_list.progress({ value: 100, text: 'Files flashed' });
    } catch (err) {
      console.error(`Error flashing [${(err as Error).message}]`);
      file_list.progress({
        text: `Error [${(err as Error).message}]`,
        bar: '#ff0000',
        bg: '#cc5555',
      });
    }
  }

  private console(debug: boolean = false): void {
    const shadow = this.rootHtmlElement.shadowRoot as ShadowRoot;
    shadow.adoptedStyleSheets = [terminal_style];

    this._terminal.open(shadow.querySelector('#console') as HTMLElement);
    this._terminal.write_str('ESPTool Flash', { colors: [Color.BOLD] });

    this.container.on('open', () => {
      setTimeout(() => {
        this._terminal.fit();
      }, 1);
    });

    this.container.on('resize', () => {
      this._terminal.fit();
    });

    if (!is_serial_supported()) {
      this._terminal.write_str('Serial API is not supported at this browser!');
      this._terminal.write_str('https://caniuse.com/web-serial');
      return;
    }

    // HTML Elements
    const select = shadow.querySelector('#serial-select') as HTMLSelectElement;
    const open = shadow.querySelector('#serial-open') as HTMLButtonElement;
    const br = shadow.querySelector('#serial-baudrate') as HTMLInputElement;
    const reset = shadow.querySelector('#serial-reset') as HTMLButtonElement;
    const erase_flash = shadow.querySelector(
      '#serial-erase-flash'
    ) as HTMLButtonElement;

    // Debug buttons
    const boot = shadow.querySelector(
      '#serial-bootloader'
    ) as HTMLButtonElement;
    const sync = shadow.querySelector('#serial-sync') as HTMLButtonElement;
    const info = shadow.querySelector('#serial-chip') as HTMLButtonElement;
    const change_baud = shadow.querySelector(
      '#serial-change-baud'
    ) as HTMLButtonElement;
    const upload_stub = shadow.querySelector(
      '#serial-upload-stub'
    ) as HTMLButtonElement;

    // Show debug
    if (!debug) {
      (shadow.querySelector('#bootloader-debug') as HTMLElement).style.display =
        'none';
    }

    shadow.querySelector('#serial-request')?.addEventListener('click', () => {
      ConsoleApp.serial_list.request();
    });

    const set_state = (state?: ESPToolState): void => {
      if (state === undefined) {
        this._state = ESPToolState.CLOSE;
        open.dataset.state = 'close';
        select.disabled = false;
        br.disabled = false;
        reset.disabled = true;
        boot.disabled = true;
        sync.disabled = true;
        info.disabled = true;
        change_baud.disabled = true;
        upload_stub.disabled = true;
        erase_flash.disabled = true;
        return;
      }

      this._state = state;
      switch (state) {
        case ESPToolState.CLOSE:
          open.dataset.state = 'close';
          select.disabled = false;
          br.disabled = false;
          reset.disabled = true;
          boot.disabled = true;
          sync.disabled = true;
          info.disabled = true;
          change_baud.disabled = true;
          upload_stub.disabled = true;
          erase_flash.disabled = true;
          break;
        case ESPToolState.OPEN:
          open.dataset.state = 'open';
          select.disabled = true;
          br.disabled = true;
          reset.disabled = false;
          boot.disabled = false;
          sync.disabled = false;
          info.disabled = true;
          change_baud.disabled = true;
          upload_stub.disabled = true;
          erase_flash.disabled = true;
          break;
        case ESPToolState.BOOTLOADER:
          open.dataset.state = 'open';
          select.disabled = true;
          br.disabled = true;
          reset.disabled = false;
          boot.disabled = false;
          sync.disabled = false;
          info.disabled = true;
          change_baud.disabled = true;
          upload_stub.disabled = true;
          erase_flash.disabled = true;
          break;
        case ESPToolState.SYNC:
          open.dataset.state = 'open';
          select.disabled = true;
          br.disabled = true;
          reset.disabled = false;
          boot.disabled = true;
          sync.disabled = true;
          info.disabled = false;
          change_baud.disabled = false;
          upload_stub.disabled = false;
          erase_flash.disabled = true;
          break;
        case ESPToolState.STUB:
          open.dataset.state = 'open';
          select.disabled = true;
          br.disabled = true;
          reset.disabled = false;
          boot.disabled = true;
          sync.disabled = true;
          info.disabled = false;
          change_baud.disabled = false;
          upload_stub.disabled = true;
          erase_flash.disabled = false;
          break;
      }
    };

    const list = ConsoleApp.serial_list;
    install_serial_events(list, select);
    const update_open = (serials: SerialConn[]): void => {
      open.disabled = serials.length === 0;
    };
    list.on('disconnect', update_open);
    list.on('connect', update_open);
    list.on('get_ports', update_open);
    update_open(list.ports);
    ConsoleApp.serial_list.get_ports();

    set_state(undefined);

    open.addEventListener('click', () => {
      if (this._loader !== undefined) {
        this._loader.close().finally(() => {});
        return;
      }

      const id = +select.value;
      if (id === 0) return;

      const serial = list.port_by_id(id);
      if (serial === undefined || serial.state === 'open') return;
      this._loader = new ESPLoader(serial);
      this._loader.on('open', () => {
        if (this._loader === undefined) return;
        set_state(ESPToolState.OPEN);
        this._terminal.write_str('Connected', color_ok);

        this._loader.callback = (data: Uint8Array) => {
          this._terminal.write(data);
        };
      });
      this._loader.on('close', () => {
        set_state(ESPToolState.CLOSE);
        this._terminal.write_str('Closed', { colors: [Color.BG_RED] });
        this._loader = undefined;
      });
      this._loader.on('sync', () => {
        set_state(ESPToolState.SYNC);
      });
      this._loader.on('stub', () => {
        set_state(ESPToolState.STUB);
      });
      this._loader.on('disconnect', () => {
        set_state(undefined);
        this._terminal.write_str('Serial device disconnected...', color_fail);
        this._loader = undefined;
      });
      this._loader.on('error', err => {
        this._terminal.write_str(`ESPTool error [${err.message}]`, color_fail);
      });

      this._loader
        .open(+br.value)
        .then(() => {
          this.bootloader_sync().finally(() => {});
        })
        .finally(() => {});
    });

    this.container.on('beforeComponentRelease', () => {
      this._loader?.close().finally(() => {});
    });

    reset.addEventListener('click', () => {
      this._loader?.signal_reset().finally(() => {
        this._terminal.write_str('Reseting device', { colors: [Color.ITALIC] });
      });
    });

    shadow
      .querySelector('#serial-terminal-clear')
      ?.addEventListener('click', () => {
        this._terminal.terminal.clear();
      });

    boot.addEventListener('click', () => {
      if (this._loader === undefined) {
        this._terminal.write_str('ESPTool not intiated...', color_warn);
        return;
      }
      this._terminal.write_str('Booting... ', { bl: false });
      this._loader
        .signal_bootloader()
        .then(async () => {
          this._terminal.write_str('done', color_ok);
        })
        .finally(() => {});
    });

    sync.addEventListener('click', () => {
      if (this._loader === undefined) {
        this._terminal.write_str('ESPTool not intiated...', color_warn);
        return;
      }
      this._terminal.write_str('Syncing...', { bl: false });
      this._loader
        .sync(20)
        .then(() => {
          this._terminal.write_str('done', color_ok);
        })
        .catch(() => {
          this._terminal.write_str('FAIL', color_fail);
        });
    });

    info.addEventListener('click', () => {
      if (this._loader === undefined) {
        this._terminal.write_str('ESPTool not intiated...', color_warn);
        return;
      }
      this.read_show_chip_info().catch(() => {
        this._terminal.write_str('fail', color_fail);
      });
    });

    change_baud.addEventListener('click', () => {
      if (this._loader === undefined) {
        this._terminal.write_str('ESPTool not intiated...', color_warn);
        return;
      }

      this.change_show_baudrate().catch(() => {
        this._terminal.write_str('fail', color_fail);
      });
    });

    upload_stub.addEventListener('click', () => {
      if (this._loader === undefined) {
        this._terminal.write_str('ESPTool not intiated...', color_warn);
        return;
      }

      this.update_show_stub().catch(e => {
        this._terminal.write_str(`fail [${e.message as string}]`, color_fail);
      });
    });

    erase_flash.addEventListener('click', () => {
      if (this._loader === undefined) {
        this._terminal.write_str('ESPTool not intiated...', color_fail);
        return;
      }

      this._terminal.write_str('Erase flash...', { bl: false });
      this._loader
        .erase_flash()
        .then(() => {
          this._terminal.write_str('done', color_ok);
        })
        .catch(() => {
          this._terminal.write_str('FAIL', color_fail);
        });
    });
  }

  private async bootloader_sync(): Promise<void> {
    this._terminal.write_str('Syncing... ', { bl: false });
    if (!(await (this._loader as ESPLoader).try_connect())) {
      this._terminal.write_str('fail', color_fail);
      await (this._loader as ESPLoader).close();
      return;
    }
    this._terminal.write_str('done', color_ok);

    try {
      await this.read_show_chip_info();
      await this.change_show_baudrate();
      await this.update_show_stub();
    } catch (e) {
      this._terminal.write_str('fail', color_fail);
    }
  }

  private async read_show_chip_info(): Promise<void> {
    this._terminal.write_str('Reading chip info... ', { bl: false });

    const res = await read_chip_info(this._loader as ESPLoader);
    this._terminal.write_str('done', color_ok);

    this._terminal.write_str(`Chip... ${chip_name(res.chip)}`);
    this._terminal.write_str(
      `Efuses...${Array.from(res.efuses)
        .map(f => hex(f))
        .join(':')}`
    );
    this._terminal.write_str(`MAC... ${mac_string(res.mac)}`);
    this._terminal.write_str(`Crystal... ${res.crystal}MHz`);
    this._terminal.write_str(
      `Flash ID... ${this._loader!.flash_size.name}` // eslint-disable-line
    );
  }

  private async change_show_baudrate(new_baud: number = 460800): Promise<void> {
    this._terminal.write_str(`Changing baudrate to ${new_baud}... `, {
      bl: false,
    });
    await (this._loader as ESPLoader).change_baudrate(new_baud);
    this._terminal.write_str('done', color_ok);
  }

  private async update_show_stub(): Promise<void> {
    this._terminal.write_str('Uploading stub... ', { bl: false });
    await (this._loader as ESPLoader).upload_stub();
    this._terminal.write_str('done', color_ok);
  }

  private save_state(): void {
    const shadow = this.rootHtmlElement.shadowRoot as ShadowRoot;
    window.console_app.set_tool_state(
      'esptool',
      {
        list: Array.from(shadow.querySelectorAll('esp-file-list'))
          .map(el => (el as ESPFlashFileList).state)
          .filter(f => f.files.length > 0),
      },
      true
    );
  }
}

interface ChipInfo {
  chip: number;
  efuses: Uint32Array;
  mac: number[];
  crystal: number;
  flash_id: number;
}

async function read_chip_info(loader: ESPLoader): Promise<ChipInfo> {
  let chip: number | undefined;
  let efuses: Uint32Array | undefined;
  for (let i = 0; i < 5; ++i) {
    try {
      chip = await loader.chip();
      efuses = await loader.efuses();
      const crystal = await loader.crystal_frequency();
      const mac = await loader.mac();
      const flash_id = await loader.flash_id();
      return {
        chip,
        efuses,
        mac,
        crystal,
        flash_id,
      };
    } catch (e) {
      console.error('Error reading data');
    }
  }
  throw new Error('Error reading chip info');
}

async function flash_files(
  loader: ESPLoader,
  files: ESPFlashFile[],
  terminal: DataTerminal,
  cb: (file: string, info: FlashImageProgress) => void,
  flags: FlashFlags
): Promise<void> {
  for (const file of files) {
    if (file.buffer === undefined)
      file.buffer = await file_to_arraybuffer(file.file);

    terminal.write_str(
      `Flashing ${file.name} at ${file.offset} [size=${file.file.size}]`
    );
    try {
      const offset = parseInt(file.offset);
      if (compression_support()) {
        terminal.write_str('Compression supported');
        const compressed_buffer = await compress_image(file.buffer, 'deflate');
        terminal.write_str(
          `Compression...${file.buffer.byteLength} -> ${
            compressed_buffer.byteLength
          } (${(
            (100 * compressed_buffer.byteLength) /
            file.buffer.byteLength
          ).toFixed(1)}%)`
        );
        await loader.flash_image_deflate(
          new Uint8Array(compressed_buffer),
          file.buffer.byteLength,
          offset,
          {
            callback: (data: FlashImageProgress) => {
              cb(file.name, data);
            },
          }
        );
      } else {
        await loader.flash_image(new Uint8Array(file.buffer), offset, {
          callback: (data: FlashImageProgress) => {
            cb(file.name, data);
          },
        });
      }
      terminal.write_str('Image flashed');
      if (flags.verify) {
        try {
          terminal.write_str('Verifiy...');
          terminal.write_str('Image... ', { bl: false });
          const hash_image = await loader.flash_md5_calc(
            offset,
            file.file.size
          );
          terminal.write_str(hash_image);
          terminal.write_str('File.... ', { bl: false });
          const hash_file = md5_digest.hash(file.buffer);
          terminal.write_str(hash_file);
          terminal.write_str(
            `Flash image verify... ${hash_image === hash_file ? 'OK' : 'FAIL'}`
          );
        } catch (err) {
          terminal.write_str(`FAIL [${(err as Error).message}]`);
          throw err;
        }
      }
    } catch (err) {
      terminal.write_str('FAIL');
      throw err;
    }
  }
  if (flags.monitor) {
    terminal.write_str('Rebooting...');
    await loader.signal_reset();
  }
}
