import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clearCache, getCached, setCached, swrGet } from '@/lib/cache';

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('cache + SWR', () => {
    it('miss sets cache and returns fresh', async () => {
        let calls = 0;
        const fetcher = vi.fn(async () => {
            calls += 1;
            return { v: 'fresh' };
        });

        const result = await swrGet('k1', 1000, fetcher);

        expect(result).toEqual({ v: 'fresh' });
        expect(getCached('k1')).toEqual({ v: 'fresh' });
        expect(calls).toBe(1);
    });

    it('hit returns cached then revalidates', async () => {
        setCached('k2', { v: 'stale' }, 1000);
        let calls = 0;

        const fetcher = vi.fn(async () => {
            calls += 1;
            return { v: 'fresh' };
        });

        const result = await swrGet('k2', 1000, fetcher);

        // immediate stale return
        expect(result).toEqual({ v: 'stale' });

        // allow microtask revalidation
        await flushPromises();

        expect(calls).toBe(1);
        expect(getCached('k2')).toEqual({ v: 'fresh' });
    });

    it('expired entry evicts and fetches fresh', async () => {
        const now = 1000;
        vi.setSystemTime(now);
        setCached('k3', { v: 'old' }, 10);

        // advance past ttl
        vi.setSystemTime(now + 20);

        expect(getCached('k3')).toBeNull();

        let calls = 0;
        const fetcher = vi.fn(async () => {
            calls += 1;
            return { v: 'new' };
        });

        const result = await swrGet('k3', 1000, fetcher);

        expect(result).toEqual({ v: 'new' });
        expect(getCached('k3')).toEqual({ v: 'new' });
        expect(calls).toBe(1);
    });
});