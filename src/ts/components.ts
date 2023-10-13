import { DockDumpComponent } from './golden-components/dock-dump';
import { MonacoComponent } from './golden-components/monaco';
import { SetupComponent } from './setup/component';
import { TerminalComponent } from './golden-components/terminal';
import { Time2AxisLineGraphComponent } from './golden-components/time_line_graph';

interface OtherComponent {
  name: string;
  component: any;
}

export const other_components: Record<string, OtherComponent> = {
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
  TerminalComponent: {
    name: 'TerminalComponent',
    component: TerminalComponent,
  },
  Time2AxisLineGraphComponent: {
    name: 'Time2AxisLineGraphComponent',
    component: Time2AxisLineGraphComponent,
  },
};
