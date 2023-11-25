import { ESPError, error_code } from './error';
import { file_to_arraybuffer, file_to_text } from '../../helper/file';
import { type ESPFlashFile, type ESPFileType, files_info } from './file_types';
import { esp_bootloader, esp_image } from './esp_image_parser';
import JSZip from 'jszip';

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

export async function read_directory(
  files: FileList | File[]
): Promise<ESPFlashFile[]> {
  const fs = Array.isArray(files) ? files : Array.from(files);
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

/**
 * Class create to be possible to configure webkitRelativePath
 */
class MFile extends File {
  private readonly _webkitRelativePath: string; // eslint-disable-line
  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options?: FilePropertyBag | undefined,
    path: string = ''
  ) {
    super(fileBits, fileName, options);
    this._webkitRelativePath = path;
  }

  // eslint-disable-next-line
  override get webkitRelativePath(): string {
    return this._webkitRelativePath;
  }
}

export async function read_zip_file(file: File): Promise<ESPFlashFile[]> {
  const f = await JSZip.loadAsync(file);
  const promises: Array<{
    name: string;
    path: string;
    promise: Promise<ArrayBuffer>;
  }> = [];
  f.forEach((path: string, file: JSZip.JSZipObject) => {
    if (!file.dir)
      promises.push({
        name: file.name.split('/').slice(-1)[0],
        path: `/${path}`,
        promise: file.async('arraybuffer'),
      });
  });
  const files: File[] = [];
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  const ff = await Promise.all(promises.map(d => d.promise));
  for (let i = 0; i < ff.length; ++i)
    files.push(
      new MFile(
        [ff[i]],
        promises[i].name,
        {
          type: /.json$/.test(promises[i].name) ? 'application/json' : '',
        },
        promises[i].path
      )
    );
  return await read_directory(files);
}

export async function zip_files(files: ESPFlashFile[]): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const flash_args: any = { flash_files: {} };
  files.forEach(f => {
    flash_args.flash_files[f.offset] = f.name;
    zip.file(f.name, f.file);
    flash_args[f.type] = { offset: f.offset, file: f.name, encrypted: false };
  });
  zip.file(flash_args_file, JSON.stringify(flash_args));
  return await zip.generateAsync({ type: 'arraybuffer' });
}
