import Websocket from "./websocket.js";
const protocols = [
    { protocol: 'ws', name: 'Websocket' },
    { protocol: 'wss', name: 'Secure Wesocket' },
    { protocol: 'http', name: 'HTTP' },
    { protocol: 'https', name: 'Secure HTTP' }
];
function time() {
    const d = new Date();
    return `${d.getHours()}`.padStart(2, '0') + ':' +
        `${d.getMinutes()}`.padStart(2, '0') + ':' +
        `${d.getSeconds()}`.padStart(2, '0') + '.' +
        `${d.getMilliseconds()}`.padStart(3, '0');
}
class WebsocketView {
    constructor(container, proto = protocols) {
        this._socket = null;
        this._sel_protocols = container.querySelector('#protocols');
        this._btn_connect = container.querySelector('#connect');
        this._in_url = container.querySelector('#url');
        this._el_data = container.querySelector('#data');
        this._el_error = container.querySelector('#error');
        this._el_input_data = container.querySelector('#input_data');
        this._btn_send_data = container.querySelector('#send_data');
        // this._in_url.focus();
        proto.forEach((v) => {
            const op = document.createElement('option');
            op.value = v.protocol;
            op.label = v.protocol;
            this._sel_protocols.appendChild(op);
        });
        this._btn_connect.onclick = () => {
            if (this._socket)
                this.close('Requested by user');
            else
                this.open();
        };
        this._btn_send_data.onclick = () => {
            if (!this._socket || this._el_input_data.value == '')
                return;
            this._socket.send(this._el_input_data.value);
            this._add_message('send-data', `>>> ${this._el_input_data.value}`);
        };
    }
    open() {
        try {
            const url = `${this._sel_protocols.selectedOptions[0].value}://${this._in_url.value}`;
            console.log(`Connecting to: ${url}`);
            this._add_message('command', `Connecting to: ${url}`);
            this._socket = new Websocket(url);
            this._socket.on('open', ev => this._on_open(ev));
            this._socket.on('message', ev => this._on_message(ev));
            this._socket.on('close', ev => this._on_close(ev));
            this._socket.on('error', ev => this._on_error(ev));
        }
        catch (e) {
            this._error("Error instantiating websocket");
            this._socket = null;
        }
    }
    close(reason = '') {
        var _a;
        (_a = this._socket) === null || _a === void 0 ? void 0 : _a.close(1000, reason);
    }
    _on_open(ev) {
        console.log('open', ev);
        this._error('');
        this._add_message('command', `Connected to ${ev.currentTarget.url}`);
        this._el_input_data.removeAttribute('disabled');
        this._btn_send_data.removeAttribute('disabled');
        this._btn_connect.textContent = 'Close';
        this._el_input_data.focus();
    }
    _on_message(ev) {
        console.log('message', ev);
        this._add_message('recv-data', `<<< ${ev.data}`);
    }
    _on_close(ev) {
        console.log('closed', ev);
        this._socket = null;
        this._add_message('command', `Socket closed`);
        this._btn_connect.textContent = 'Connect';
        this._el_input_data.setAttribute('disabled', '');
        this._btn_send_data.setAttribute('disabled', '');
    }
    _on_error(ev) {
        console.log('error', ev);
        this._error("Error ocurred");
    }
    _error(message = "") {
        console.error(message);
        this._el_error.textContent = message;
    }
    _add_message(type, message) {
        const p = document.createElement('pre');
        p.classList.add('command-data', type);
        p.textContent += `${time()}: ${message}`;
        this._el_data.appendChild(p);
    }
}
new WebsocketView(document.body);
