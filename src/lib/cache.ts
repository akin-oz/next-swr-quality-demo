type Entry<T> = {
  value: T;
  expiry: number;
};

const store = new Map<string, Entry<unknown>>();

export function clearCache() {
  store.clear();
}

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiry: Date.now() + ttlMs });
}

export async function swrGet<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = getCached<T>(key);

  if (cached !== null) {
    fetcher()
      .then((fresh) => setCached(key, fresh, ttlMs))
      .catch((err) => {
        console.warn(`SWR revalidate failed for ${key}`, err);
      });
    return cached;
  }

  const fresh = await fetcher();
  setCached(key, fresh, ttlMs);
  return fresh;
}
