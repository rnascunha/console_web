import { DockDumpComponent } from './golden-components/dock-dump';
import { MonacoComponent } from './golden-components/monaco';
import { SetupComponent } from './setup/component';
import { TerminalComponent } from './golden-components/terminal';
import { TimeLineGraphComponent } from './golden-components/time_line_graph';

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
  TimeLineGraphComponent: {
    name: 'TimeLineGraphComponent',
    component: TimeLineGraphComponent,
  },
};
