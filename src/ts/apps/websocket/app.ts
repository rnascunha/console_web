import { URLApp } from '../app';
import { type WebSocketState, webSocketStateDefault } from './websocket';

export class WSApp extends URLApp {
  constructor(protocol: string, component: any, state?: WebSocketState) {
    super(protocol, component, webSocketStateDefault);
  }
}
