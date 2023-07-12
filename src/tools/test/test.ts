import './test.css';

import '../../ts/web-components/calendar/calendar-timestamp';
// import '../../ts/web-components/binary-dump/binary-dump';
// import '../../ts/web-components/binary-input/text-binary';
// import '../../ts/web-components/binary-input/text-select-binary';

import { CalendarTimestamp } from '../../ts/web-components/calendar/calendar-timestamp';

const calendar = document.querySelector('#calendar') as CalendarTimestamp;
calendar.update();
setInterval(() => {
  calendar.update(new Date());
}, 10);
