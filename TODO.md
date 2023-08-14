# TODO

## General

- [x] Make popup golden-layout work (or disable if not possible);
- [ ] Clean code;
- [x] Add git commit to check on page;
- [x] Structure better the code.
- [x] Add better typescript configuration (tsconfig);
- [x] Use a prettify tool to code.
- [ ] Work with electron
- [x] Make better input (not just text, but also binary);
- [x] Github Actions auto publish tool
- [x] change project name (Console Web?)
- [ ] Save output data to file. Make it loadable inside de application.
- [ ] Chunks are too big. Split it.
- [x] Add persistent data.
- [ ] Add keyboard shortcuts.
- [ ] Document it :| (code and manual)

### CSS (style)

- [ ] Structure it better;
- - [ ] Create css of icons;
- - [ ] Theme like. Create --root variables;

### Setup

- [ ] Erase data by app, tool.

### Brainstorm

- [ ] On site clipboard to copy "things" to be copied in app;
- [ ] Make 'variable' to be used all over the application;
- [ ] Make search/execute prompt.
- [ ] Notification board;
- [ ] Statistic data (per app, interface...);
- [ ] Different outputs/parsers:
  - [x] Data (how is now)
  - [ ] Terminal
  - [ ] Parser: JSON, www-encoded, ...
- [ ] Diffrent inputs/parsers, ...
  - [x] Binary (how is now),
  - [ ] JSON.

### Fix

- [ ] Popout at a poped out window error (disable?);
- [x] Serial issueing 2 disconnect messages
- [ ] Necessary to treat loading big files (`input-dump` tool for example). Need to slice?
- [x] How to import `css` files as modules? Use to import local styles at `tools`/`apps`/`setup` inside shadowDOMs.
- [x] Flywindows (`draggable-popout`) should be resizeable.
- [ ] Content (at flywindows) should scroll only the body (not all the window as is now).
- [ ] GoldenLayout inside another (coder, json) does not work correctly.

## Apps

### Websocket

#### Fix

- [ ] Check workaround at `websocket.ts` (`config_socket` function) to load custom-element;

### HTTP

- [ ] HTTP fetch error not getting caught correctly;
- [x] ~~HTTP(s): show headers~~. Made to responses. Requests can`t add custom headers now;
- [ ] HTTP request must have a more complete input, been possible to add headers.

### Serial

- [x] Add Web Serial API;

#### Fix

- [ ] Popout not working with `serial` protocol;

## Tools

- [x] Add query parameters at address bar and shared button at input tool.
- [x] Save parameters offline at browser.
- [x] Direct link to tools.

# ESP_parser

- [x] Bootloader description just work for the newest IDF (v5.2). Handle old versions;
- [ ] Parse `partition-table.bin` and `ota_data_initial.bin` binary files;
- [ ] Show segments (like esptool does);
- [ ] Support more chips, and read other features from chip;
- [ ] Make lib `esp` as a library;
- [x] Rename to `ESPTool`;
- [ ] Make it possible drag files/directories.

### New Tools

- [x] Tool to convert date/time/timestamp. UTC and other timezones.
- [ ] Add more time functionties to timestamp tool. Ex.: Cronometer, map with clock citys/timezones
- [ ] Generate Cripto keys (CA, private/public keys);
- [ ] Darta parses: JSON...
- [ ] ESP32 features: flash binary...
