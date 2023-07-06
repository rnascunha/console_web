import type { InputDumpOptions } from '../../ts/web-components/input-dump/input_dump';

const dbName = 'input-binary';
const dbVersion = 1;
const objectStoreName = 'binary-data';

export async function open_db(): Promise<IDBDatabase> {
  return await new Promise(function (resolve, reject) {
    const openRequest = window.indexedDB.open(dbName, dbVersion);
    openRequest.onerror = ev => {
      reject(ev);
    };

    openRequest.onsuccess = ev => {
      resolve((ev.target as IDBOpenDBRequest).result);
    };

    openRequest.onupgradeneeded = ev => {
      const db: IDBDatabase = (ev.target as IDBOpenDBRequest).result;
      const store = db.createObjectStore(objectStoreName);
      store.transaction.oncomplete = () => {};
    };
  });
}

export async function read_db(db: IDBDatabase): Promise<InputDumpOptions> {
  return await new Promise(function (resolve, reject) {
    const request = db
      .transaction(objectStoreName, 'readonly')
      .objectStore(objectStoreName)
      .get('data');
    request.onsuccess = ev => {
      resolve((ev.target as IDBRequest).result);
    };
    request.onerror = ev => {
      reject(ev);
    };
  });
}

export async function write_db(
  db: IDBDatabase,
  data: InputDumpOptions
): Promise<void> {
  await new Promise<void>(function (resolve, reject) {
    const request = db
      .transaction(objectStoreName, 'readwrite')
      .objectStore(objectStoreName)
      .put(data, 'data');
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = ev => {
      reject(ev);
    };
  });
}
