import EventEmitter from "./event_emitter.js";
/**
 * https://www.rfc-editor.org/rfc/rfc6455.html#section-11.7
 */
export const WebSocketErrors = {
    1000: 'Normal Closure',
    1001: 'Going Away',
    1002: 'Protocol error',
    1003: 'Unsupported Data',
    1005: 'No Status Rcvd',
    1006: 'Abnormal Closure',
    1007: 'Invalid frame',
    1008: 'Policy Violation',
    1009: 'Message Too Big',
    1010: 'Mandatory Ext.',
    1011: 'Internal Server Error',
    1015: 'TLS handshake'
};
export default class Websocket extends EventEmitter {
    constructor(url, protocol = []) {
        super();
        this._socket = null;
        try {
            this._socket = new WebSocket(url, protocol);
            this._socket.onopen = ev => this.on_open(ev);
            this._socket.onmessage = ev => this.on_message(ev);
            this._socket.onclose = ev => this.on_close(ev);
            this._socket.onerror = ev => this.on_error(ev);
        }
        catch (e) {
            console.log('catch constructor', e);
            this._socket = null;
            throw e;
        }
    }
    send(message) {
        var _a;
        (_a = this._socket) === null || _a === void 0 ? void 0 : _a.send(message);
    }
    close(code = 1000, reason = "") {
        if (this._socket === null)
            throw "no valid socket";
        this._socket.close(code, reason);
    }
    on_open(ev) {
        this.emit('open', ev);
    }
    on_message(ev) {
        this.emit('message', ev);
    }
    on_close(ev) {
        this._socket = null;
        this.emit('close', ev);
        this.clear_events();
    }
    on_error(ev) {
        this.emit('error', ev);
    }
}
