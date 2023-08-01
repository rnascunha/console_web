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
