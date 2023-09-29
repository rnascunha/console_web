import '../../ts/web-components/progress-bar';
import { ProgressBar } from '../../ts/web-components/progress-bar';

const progress = document.querySelector('#progress') as ProgressBar;
const barc = document.querySelector('#bar') as HTMLInputElement;
const bg = document.querySelector('#bg') as HTMLInputElement;
const value = document.querySelector('#value') as HTMLInputElement;
const add_value = document.querySelector('#add-value') as HTMLButtonElement;
const minus_value = document.querySelector('#minus-value') as HTMLButtonElement;
const text = document.querySelector('#text') as HTMLInputElement;

console.log('colors', progress.bar_color, progress.bg_color);

barc.value = progress.bar_color;
bg.value = progress.bg_color;
value.value = progress.value.toString();
text.value = progress.text;
progress.text = `${text.value} ${value.value}/100`;

add_value.addEventListener('click', () => {
  ++progress.value;
  value.value = progress.value.toString();
  progress.text = `${text.value} ${value.value}/100`;
});

minus_value.addEventListener('click', () => {
  --progress.value;
  value.value = progress.value.toString();
  progress.text = `${text.value} ${value.value}/100`;
});

value.addEventListener('change', () => {
  progress.value = +value.value;
  value.value = progress.value.toString();
  progress.text = `${text.value} ${value.value}/100`;
});

text.addEventListener('keyup', ev => {
  progress.text = `${text.value} ${value.value}/100`;
});

bg.addEventListener('change', () => {
  progress.bg_color = bg.value;
});

barc.addEventListener('change', () => {
  progress.bar_color = barc.value;
});
