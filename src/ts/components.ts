import { DockDumpComponent } from './golden-components/dock-dump';
import { MonacoComponent } from './golden-components/monaco';
import { SerialConsoleComponent } from './apps/serial/component';
import { SetupComponent } from './setup/component';

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
  MonacoComponent: {
    name: 'MonacoComponent',
    component: MonacoComponent,
  },
};
