function num(v: string | undefined, fallback: number): number {
  const n = v ? Number(v) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const ITEMS_BASE_URL =
  process.env.NEXT_PUBLIC_ITEMS_BASE_URL ?? "/api/items";

export const DEFAULT_TTL_MS = num(
  process.env.NEXT_PUBLIC_DEFAULT_TTL_MS,
  10_000,
);

