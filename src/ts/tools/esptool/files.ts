import { ESPError, error_code } from '../../libs/esptool.ts/error';
import { file_to_arraybuffer, file_to_text } from '../../helper/file';
import { type ESPFlashFile, type ESPFileType, files_info } from './types';
import {
  esp_bootloader,
  esp_image,
} from '../../libs/esptool.ts/esp_image_parser';

const flash_args_file = 'flasher_args.json';

export async function discover_file(file: File): Promise<ESPFlashFile> {
  const buffer = await file_to_arraybuffer(file);
  try {
    await esp_image(buffer);
    return {
      name: file.name,
      file,
      type: 'app',
      offset: `0x${files_info.app.offset.toString(16)}`,
      buffer,
    };
  } catch (e) {
    try {
      await esp_bootloader(buffer);
      return {
        name: file.name,
        file,
        type: 'bootloader',
        offset: `0x${files_info.bootloader.offset.toString(16)}`,
        buffer,
      };
    } catch (e) {
      const type =
        file.name ===
        files_info.partition_table.name.split('/').slice(-1).join('') // partition-table.bin
          ? 'partition-table'
          : 'other';
      const offset =
        type === 'other'
          ? '0'
          : `0x${files_info.partition_table.offset.toString(16)}`;
      return {
        name: file.name,
        file,
        type,
        offset,
        buffer,
      };
    }
  }
}

function binary_file_type(
  flash_args: Record<any, any>,
  file: string
): ESPFileType {
  let type: string = 'other';
  Object.entries(flash_args).some(([t, v]) => {
    if (v.file !== undefined && v.file === file) {
      type = t;
      return true;
    }
    return false;
  });

  return type;
}

export async function read_directory(files: FileList): Promise<ESPFlashFile[]> {
  const fs = Array.from(files);
  let base: string = '';
  const flash_args = fs.find(f => {
    if (f.name !== flash_args_file) return false;

    const d = f.webkitRelativePath.split('/');
    if (d.length > 3) return false;

    base = d.slice(0, -1).join('/');
    return true;
  });

  if (flash_args === undefined || flash_args.type !== 'application/json')
    throw new ESPError(
      error_code.FILE_NOT_FOUND,
      'File not found',
      flash_args_file
    );

  const text = await file_to_text(flash_args);
  const data = JSON.parse(text);

  const output: ESPFlashFile[] = [];
  Object.entries(data.flash_files).forEach(([offset, name]) => {
    const file = fs.find(n => {
      return n.webkitRelativePath === `${base}/${name as string}`;
    });
    if (file === undefined)
      throw new ESPError(error_code.FILE_NOT_FOUND, 'File not found', name);
    output.push({
      offset,
      name: name as string,
      file,
      type: binary_file_type(data, name as string),
    });
  });

  return output;
}
