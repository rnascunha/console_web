export async function open(
  db_name: string,
  db_version: number = 1
): Promise<DB> {
  return await new Promise(function (resolve, reject) {
    const openRequest = window.indexedDB.open(db_name, db_version);
    openRequest.onerror = ev => {
      reject(ev);
    };

    openRequest.onsuccess = ev => {
      resolve(new DB((ev.target as IDBOpenDBRequest).result));
    };

    openRequest.onupgradeneeded = ev => {
      const db: IDBDatabase = (ev.target as IDBOpenDBRequest).result;
      const store = db.createObjectStore('protocol');
      store.transaction.oncomplete = () => {};
    };
  });
}

export class DB {
  private readonly _db: IDBDatabase;

  constructor(instance: IDBDatabase) {
    this._db = instance;
  }

  public async read<T>(obj_store: string, attr: string): Promise<T> {
    return await new Promise((resolve, reject) => {
      const request = this._db
        .transaction(obj_store, 'readonly')
        .objectStore(obj_store)
        .get(attr);
      request.onsuccess = ev => {
        resolve((ev.target as IDBRequest).result as T);
      };
      request.onerror = ev => {
        reject(ev);
      };
    });
  }

  public async read_all<T>(obj_store: string): Promise<T> {
    return await new Promise((resolve, reject) => {
      const request = this._db
        .transaction(obj_store, 'readonly')
        .objectStore(obj_store)
        .getAll();
      request.onsuccess = ev => {
        resolve((ev.target as IDBRequest).result as T);
      };
      request.onerror = ev => {
        reject(ev);
      };
    });
  }

  public async read_iterator(obj_store: string): Promise<Record<string, any>> {
    return await new Promise((resolve, reject) => {
      const request = this._db
        .transaction(obj_store, 'readonly')
        .objectStore(obj_store)
        .openCursor();

      const ret: Record<string, any> = {};
      request.onsuccess = ev => {
        const cursor = (ev.target as IDBRequest).result;
        if (cursor !== null) {
          ret[cursor.key] = cursor.value;
          cursor.continue();
        } else resolve(ret);
      };
      request.onerror = ev => {
        reject(ev);
      };
    });
  }

  public async write<T>(
    obj_store: string,
    attr: string,
    data: T
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const request = this._db
        .transaction(obj_store, 'readwrite')
        .objectStore(obj_store)
        .put(data, attr);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = ev => {
        reject(ev);
      };
    });
  }
}
