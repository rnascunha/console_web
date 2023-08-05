import { ESPError, error_code } from '../../libs/esp/error';
import { ESPFlashFileList } from './web-components/file-list';
import { file_to_text } from '../../helper/file';

const flash_args_file = 'flasher_args.json';

export interface ESPFlashFile {
  offset: string;
  name: string;
  file: File;
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
    output.push({ offset, name: name as string, file });
  });

  return output;
}

export function output_files(files: ESPFlashFile[]): HTMLElement {
  const div = new ESPFlashFileList(files);
  return div;
}
