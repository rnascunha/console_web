/**
 * https://rjzaworski.com/2019/10/event-emitters-in-typescript
 */
export default class EventEmitter {
    constructor() {
        this._listeners = {};
    }
    on(eventName, fn) {
        this._listeners[eventName] = (this._listeners[eventName] || []).concat(fn);
    }
    off(eventName, fn) {
        this._listeners[eventName] = (this._listeners[eventName] || []).filter(f => f !== fn);
    }
    emit(eventName, params) {
        (this._listeners[eventName] || []).forEach(function (fn) {
            fn(params);
        });
    }
    clear_events() {
        this._listeners = {};
    }
}
