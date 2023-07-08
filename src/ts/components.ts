import { DockDumpComponent } from './golden-components/component-utility';
import { SerialConsoleComponent } from './apps/serial/component';
import { SetupComponent } from './tools/setup/component';

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
  SetupComponent: {
    name: 'SetupComponent',
    component: SetupComponent,
  },
};
