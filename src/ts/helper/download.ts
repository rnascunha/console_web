export function download(
  filename: string,
  data: BlobPart,
  blob_option: BlobPropertyBag = { type: 'text/plain' }
): void {
  const blob = new Blob([data], blob_option);
  const elem = document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
}

interface FilePickerOptions {
  accept?: string;
  multiple?: boolean;
}

export async function open_file_picker(
  options?: FilePickerOptions
): Promise<FileList | null> {
  return await new Promise(function (resolve, reject) {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';

    if (options !== undefined) {
      if (options?.accept !== undefined) input.accept = options.accept;
      if (options?.multiple !== undefined) input.multiple = options.multiple;
    }

    input.onchange = () => {
      resolve(input.files);
    };
    input.click();
  });
}
