import './input.css';
import '../../ts/components/binary-dump/binary-dump';
import { BinaryDump } from '../../ts/components/binary-dump/binary-dump';

const input = document.querySelector('#input') as HTMLInputElement;
const bl = document.querySelector('#breakline') as HTMLInputElement;
const bd = document.querySelector('#data-dump') as BinaryDump;
const encoder = new TextEncoder();

bl.onchange = () => bd.update(encoder.encode(input.value), +bl.value);
input.onkeyup = () => bd.update(encoder.encode(input.value), +bl.value);
input.dispatchEvent(new Event('keyup'));
