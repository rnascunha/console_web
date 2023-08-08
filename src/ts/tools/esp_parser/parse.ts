import { file_to_arraybuffer } from '../../helper/file';
import { esp_bootloader, esp_image } from '../../libs/esp/esp_image_parser';
import { output_image_html, output_file_html } from './format';
import type { ESPFlashFile } from './types';

export async function output_file(file: ESPFlashFile): Promise<HTMLElement> {
  if (file.buffer === undefined)
    file.buffer = await file_to_arraybuffer(file.file);

  switch (file.type) {
    case 'app':
      return output_image_html(file.file, await esp_image(file.buffer), [
        'file',
        'header_segment',
        'hash',
        'header',
        'description',
      ]);
    case 'bootloader':
      return output_image_html(file.file, await esp_bootloader(file.buffer), [
        'header',
        'file',
        'hash',
        'header_segment',
        'bootloader_description',
      ]);
    case 'partition-table':
    default:
      return output_file_html(file.file);
  }
}
