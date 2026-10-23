/** The slice of a persisted Zustand store this needs. */
interface PersistedStore {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
}

/**
 * Resolves once every store has loaded from storage (StoreHydrator triggers
 * it after mount). Sync must never read or write a store before then: its
 * empty initial state would look like "no data", and a restore written
 * into it would overwrite the real ledger.
 */
export function whenHydrated(stores: PersistedStore[]): Promise<void> {
  const pending = stores.filter((store) => !store.persist.hasHydrated());
  if (pending.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    let left = pending.length;
    const stop = pending.map((store) =>
      store.persist.onFinishHydration(() => {
        left -= 1;
        if (left > 0) return;
        stop.forEach((unsubscribe) => unsubscribe());
        resolve();
      }),
    );
  });
}
