const DATABASE = "cskh-local-v2";
const STORE = "entries";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Trình duyệt chưa cho phép lưu dữ liệu offline."));
      return;
    }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(
        new Error("Đóng các tab ứng dụng cũ rồi thử lại để mở bộ nhớ offline."),
      );
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  action: (
    store: IDBObjectStore,
    result: (value: T) => void,
    fail: (error: unknown) => void,
  ) => void,
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let value: T;
    tx.oncomplete = () => {
      db.close();
      resolve(value);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Không lưu được dữ liệu trên thiết bị."));
    };
    tx.onerror = () => {
      /* The transaction abort event reports the failure. */
    };
    const fail = (error: unknown) => {
      tx.abort();
      reject(error);
    };
    try {
      action(
        tx.objectStore(STORE),
        (result) => {
          value = result;
        },
        fail,
      );
    } catch (error) {
      fail(error);
    }
  });
}

export function readStored<T>(key: string): Promise<T | undefined> {
  return transaction("readonly", (store, result) => {
    const request = store.get(key);
    request.onsuccess = () => result(request.result as T | undefined);
  });
}
export function writeStored<T>(key: string, value: T): Promise<void> {
  return transaction("readwrite", (store) => {
    store.put(value, key);
  });
}
export function removeStored(key: string): Promise<void> {
  return transaction("readwrite", (store) => {
    store.delete(key);
  });
}
// Read/modify/write happens within one transaction, including across browser tabs.
export function updateStored<T>(
  key: string,
  update: (previous: unknown) => T,
): Promise<T> {
  return transaction("readwrite", (store, result, fail) => {
    const request = store.get(key);
    request.onsuccess = () => {
      try {
        const value = update(request.result);
        store.put(value, key);
        result(value);
      } catch (error) {
        fail(error);
      }
    };
  });
}
