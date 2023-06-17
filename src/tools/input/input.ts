import './input.css';
import '../../ts/components/binary-dump/binary-dump';
import '../../ts/components/binary-input/text-binary';
import { BinaryDump } from '../../ts/components/binary-dump/binary-dump';

const input = document.querySelector('#input') as HTMLInputElement;
const bl = document.querySelector('#breakline') as HTMLInputElement;
const bd = document.querySelector('#data-dump') as BinaryDump;
const encoder = new TextEncoder();
const input_binary = document.querySelector('#input-binary') as BinaryInput;

bl.onchange = () => bd.update(encoder.encode(input.value), +bl.value);
input.onkeyup = () => bd.update(encoder.encode(input.value), +bl.value);
input.dispatchEvent(new Event('keyup'));
document.querySelectorAll('input[name=encode]').forEach(v => {
  const i = v as HTMLInputElement;
  i.onclick = ev => {
    input_binary.encode = i.value as Encoding;
  };
});
