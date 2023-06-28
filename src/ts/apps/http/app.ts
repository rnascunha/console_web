import { URLApp } from '../app';
import { type HTTPState, httpStateDefault } from './http';

export class HTTPApp extends URLApp<HTTPState> {
  constructor(protocol: string, component: any, state?: HTTPState) {
    super(protocol, component, httpStateDefault);
  }
}
