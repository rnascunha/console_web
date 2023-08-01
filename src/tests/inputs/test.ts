import '../../ts/web-components/binary-dump/binary-dump';
import '../../ts/web-components/binary-input/text-binary';
import '../../ts/web-components/binary-input/text-area-binary';
import '../../ts/web-components/input-dump/input-dump';

import { Encoding, encoding } from '../../ts/libs/binary-dump';
import { BinaryInput } from '../../ts/web-components/binary-input/text-binary';
import { BinaryAreaInput } from '../../ts/web-components/binary-input/text-area-binary';
import { BinaryDump } from '../../ts/web-components/binary-dump/binary-dump';

interface BinaryInputTest extends HTMLElement {
  encode: Encoding;
  data: Uint8Array;
}

function make_inputs_test<T extends BinaryInputTest>(
  input_id: string,
  select_encode_id: string,
  output_id: string
): void {
  const input = document.querySelector(input_id) as T;
  const encode = document.querySelector(select_encode_id) as HTMLSelectElement;
  const output = document.querySelector(output_id) as BinaryDump;

  encoding.forEach(enc => {
    const opt = new Option(enc, enc, undefined, enc === input.encode);
    encode.appendChild(opt);
  });

  encode.addEventListener('change', () => {
    input.encode = encode.value as Encoding;
  });

  input.addEventListener('keyup', ev => {
    output.update(input.data, 8);
  });
}

make_inputs_test<BinaryInput>(
  '#text-binary',
  '#encoding',
  '#text-binary-output'
);
make_inputs_test<BinaryAreaInput>(
  '#text-area-binary',
  '#encoding-area',
  '#text-area-binary-output'
);
