export async function file_to_arraybuffer(
  blob: File | Blob
): Promise<ArrayBuffer> {
  return await new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onerror = e => {
      reject(reader.error);
    };

    reader.onload = e => {
      resolve(reader.result as ArrayBuffer);
    };

    reader.readAsArrayBuffer(blob);
  });
}

export async function file_to_text(blob: File | Blob): Promise<string> {
  return await new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onerror = e => {
      reject(reader.error);
    };

    reader.onload = e => {
      resolve(reader.result as string);
    };

    reader.readAsText(blob);
  });
}
