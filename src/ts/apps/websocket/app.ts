import { URLApp } from '../app';
import { type WebSocketState, webSocketStateDefault } from './websocket';

export class WSApp extends URLApp<WebSocketState> {
  constructor(protocol: string, component: any, state?: WebSocketState) {
    super(protocol, component, webSocketStateDefault);
  }
}
