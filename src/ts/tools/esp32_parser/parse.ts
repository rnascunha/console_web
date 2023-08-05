import { file_to_arraybuffer } from '../../helper/file';
import { esp_image } from '../../libs/esp/esp_image_parser';
import { output_image_html, output_file_html } from './format';
import type { ESPFlashFile } from './types';
import type { ESPImage } from '../../libs/esp/types';

export async function output_file(file: ESPFlashFile): Promise<HTMLElement> {
  if (file.buffer === undefined)
    file.buffer = await file_to_arraybuffer(file.file);

  const parsed: ESPImage | null = ['app', 'bootloader'].includes(file.type)
    ? await esp_image(file.buffer)
    : null;

  switch (file.type) {
    case 'app':
      return output_image_html(file.file, parsed as ESPImage);
    case 'bootloader':
      return output_image_html(file.file, parsed as ESPImage, [
        'header',
        'file',
        'header_segment',
        'hash',
      ]);
    case 'partition-table':
    default:
      return output_file_html(file.file);
  }
}
