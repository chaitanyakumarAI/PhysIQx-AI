/**
 * The athlete's images (progress photos, an uploaded avatar) as Blobs in
 * IndexedDB, keyed by media id. They used to be data URLs inside the
 * persisted profile store: one large photo could fill localStorage's ~5 MB
 * quota, after which every store silently failed to save.
 *
 * Where IndexedDB is unavailable (some private modes, tests) it falls back
 * to memory: the app keeps working and images last until a reload.
 */
export interface MediaBackend {
  get(id: string): Promise<Blob | undefined>;
  put(id: string, blob: Blob): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

const DB_NAME = "physiqx-media";
const STORE = "blobs";

export function memoryBackend(): MediaBackend {
  const blobs = new Map<string, Blob>();
  return {
    get: async (id) => blobs.get(id),
    put: async (id, blob) => void blobs.set(id, blob),
    delete: async (id) => void blobs.delete(id),
    clear: async () => blobs.clear(),
    keys: async () => [...blobs.keys()],
  };
}

function indexedDbBackend(factory: IDBFactory): MediaBackend {
  let db: Promise<IDBDatabase> | null = null;
  const open = () =>
    (db ??= new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));
  const run = <T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) =>
    open().then(
      (database) =>
        new Promise<T>((resolve, reject) => {
          const transaction = database.transaction(STORE, mode);
          const request = operation(transaction.objectStore(STORE));
          transaction.oncomplete = () => resolve(request.result);
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error);
        }),
    );
  return {
    get: (id) => run("readonly", (store) => store.get(id) as IDBRequest<Blob | undefined>),
    put: (id, blob) => run("readwrite", (store) => store.put(blob, id)).then(() => undefined),
    delete: (id) => run("readwrite", (store) => store.delete(id)).then(() => undefined),
    clear: () => run("readwrite", (store) => store.clear()).then(() => undefined),
    keys: () => run("readonly", (store) => store.getAllKeys()).then((keys) => keys.map(String)),
  };
}

let backend: MediaBackend | null = null;

function current(): MediaBackend {
  backend ??= typeof indexedDB === "undefined" ? memoryBackend() : indexedDbBackend(indexedDB);
  return backend;
}

/** Runs on IndexedDB; if it can't be opened, switches to memory for good. */
async function call<T>(operation: (media: MediaBackend) => Promise<T>): Promise<T> {
  try {
    return await operation(current());
  } catch (error) {
    if (backend && !(backend as { memory?: boolean }).memory) {
      console.warn("[media] IndexedDB unavailable, keeping images in memory:", error);
      backend = Object.assign(memoryBackend(), { memory: true });
      return operation(backend);
    }
    throw error;
  }
}

export const getMedia = (id: string) => call((media) => media.get(id));
export const putMedia = (id: string, blob: Blob) => call((media) => media.put(id, blob));
export const deleteMedia = (id: string) => call((media) => media.delete(id));
export const clearMedia = () => call((media) => media.clear());
export const listMediaIds = () => call((media) => media.keys());

/** "photo-1730700000000-k3j9a": the timestamp lets cleanup skip fresh saves. */
export function newMediaId(kind: "photo" | "avatar"): string {
  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** When a media id was minted (ms), or null for ids not made by newMediaId. */
export function mediaIdCreatedAt(id: string): number | null {
  const stamp = Number(id.split("-")[1]);
  return Number.isFinite(stamp) && stamp > 0 ? stamp : null;
}

/** Tests: swap in a backend (memoryBackend()); null restores the default. */
export function setMediaBackend(next: MediaBackend | null): void {
  backend = next;
}
