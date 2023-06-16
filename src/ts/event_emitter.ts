/**
 * https://rjzaworski.com/2019/10/event-emitters-in-typescript
 */

type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on: <K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) => void;
  off: <K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) => void;
  emit: <K extends EventKey<T>>(eventName: K, params: T[K]) => void;
}

export default class EventEmitter<T extends EventMap> implements Emitter<T> {
  private _listeners: {
    [K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
  } = {};

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this._listeners[eventName] = (this._listeners[eventName] ?? []).concat(fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this._listeners[eventName] = (this._listeners[eventName] ?? []).filter(
      f => f !== fn
    );
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
    (this._listeners[eventName] ?? []).forEach(function (fn) {
      fn(params);
    });
  }

  clear_events(): void {
    this._listeners = {};
  }
}
