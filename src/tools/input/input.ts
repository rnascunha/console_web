import './input.css';
import '../../ts/web-components/binary-dump/binary-dump';
import '../../ts/web-components/binary-input/text-binary';
import { BinaryDump } from '../../ts/web-components/binary-dump/binary-dump';
import { BinaryInput } from '../../ts/web-components/binary-input/text-binary';
import { type Encoding } from '../../ts/libs/binary-dump';

const bl = document.querySelector('#breakline') as HTMLInputElement;
const bd = document.querySelector('#data-dump') as BinaryDump;
const input_binary = document.querySelector('#input-binary') as BinaryInput;
input_binary.encode = 'text';
// const dump = document.querySelector('#dump') as HTMLDivElement;

bl.onchange = () => update();
input_binary.onkeyup = () => update();
document.querySelectorAll('input[name=encode]').forEach(v => {
  const i = v as HTMLInputElement;
  i.onclick = () => {
    input_binary.encode = i.value as Encoding;
    update();
  };
});

function update() {
  bd.update(input_binary.data, +bl.value);
}

document.querySelectorAll('input[name=binary-hide]').forEach(v => {
  const i = v as HTMLInputElement;
  i.onclick = () => {
    if (i.checked) bd.hide(i.value as Encoding);
    else bd.show(i.value as Encoding);
  };

  if (bd.is_hidden(i.value as Encoding)) i.checked = true;
});
