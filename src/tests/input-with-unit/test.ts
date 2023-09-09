import '../../ts/web-components/input-with-unit';
import { InputWithUnit } from '../../ts/web-components/input-with-unit';

const el = document.querySelector('#input-text') as InputWithUnit;
el.value = 'teste';

document.querySelector('#input')?.addEventListener('keyup', ev => {
  const a = (ev.target as InputWithUnit).value;
  console.log(a, +a);
});
