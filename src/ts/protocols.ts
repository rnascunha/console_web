import { DockDumpComponent } from './golden-components/component-utility';
import { HTTPComponent } from './apps/http/component';
import { WSComponent } from './apps/websocket/component';
import {
  SerialComponent,
  SerialConsoleComponent,
} from './apps/serial/component';

interface Component {
  readonly name: string;
  readonly component: any;
  readonly protocols: string[];
}

export const components: Record<string, Component> = {
  WSComponent: {
    name: 'WSComponent',
    component: WSComponent,
    protocols: ['ws', 'wss'],
  },
  HTTPComponent: {
    name: 'HTTPComponent',
    component: HTTPComponent,
    protocols: ['http', 'https'],
  },
  SerialComponent: {
    name: 'SerialComponent',
    component: SerialComponent,
    protocols: ['serial'],
  },
};

const onlySecureConnectionsProtocols: string[] = ['wss', 'https', 'serial'];

interface OtherComponent {
  name: string;
  component: any;
}

export const other_components: Record<string, OtherComponent> = {
  SerialConsoleComponent: {
    name: 'SerialConsoleComponent',
    component: SerialConsoleComponent,
  },
  DockDumpComponent: {
    name: 'DockDumpComponent',
    component: DockDumpComponent,
  },
};

export function get_component(name: string): any {
  if (name in components) return components[name].component;
  if (name in other_components) return other_components[name].component;

  return undefined;
}

export interface Protocol {
  readonly protocol: string;
  readonly component: Component;
}

export const protocols: Record<string, Protocol> = (function () {
  const protocols: Record<string, Protocol> = {};
  Object.values(components).forEach(comp => {
    comp.protocols.forEach(proto => {
      if (
        window.location.protocol === 'http:' ||
        onlySecureConnectionsProtocols.includes(proto)
      )
        protocols[proto] = { protocol: proto, component: comp.component };
    });
  });
  return protocols;
})();
