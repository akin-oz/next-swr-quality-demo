import { Item, ItemSchema } from '@/lib/models';
import { http } from '@/lib/http';
import { getCached, setCached } from '@/lib/cache';
import { z } from 'zod';

const BASE = '/api/items';

async function fetchList(): Promise<Item[]> {
  const { data } = await http<{ data: Item[] }>(BASE, {
    schema: z.object({ data: z.array(ItemSchema) }),
  });
  return data;
}

async function fetchOne(id: string): Promise<Item> {
  const { data } = await http<{ data: Item }>(`${BASE}/${id}`, {
    schema: z.object({ data: ItemSchema }),
  });
  return data;
}

export async function getItems(
  ttlMs: number,
  revalidate = true,
): Promise<Item[]> {
  const key = 'items:list';
  const cached = getCached<Item[]>(key);
  if (cached) {
    if (revalidate) {
      void fetchList()
        .then((fresh) => setCached(key, fresh, ttlMs))
        .catch(() => {});
    }
    return cached;
  }

  const fresh = await fetchList();
  setCached(key, fresh, ttlMs);
  return fresh;
}

export async function getItem(
  id: string,
  ttlMs: number,
  revalidate = true,
): Promise<Item> {
  const key = `items:${id}`;
  const cached = getCached<Item>(key);
  if (cached) {
    if (revalidate) {
      void fetchOne(id)
        .then((fresh) => setCached(key, fresh, ttlMs))
        .catch(() => {});
    }
    return cached;
  }

  const fresh = await fetchOne(id);
  setCached(key, fresh, ttlMs);
  return fresh;
}