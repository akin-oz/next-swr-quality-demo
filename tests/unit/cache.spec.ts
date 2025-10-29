import { describe, it, expect, beforeEach, vi } from "vitest";
import { clearCache, getCached, setCached, swrGet } from "@/lib/cache";

// Small helper to flush microtasks
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("cache (TTL + SWR)", () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  it("cache miss -> fetch and store (swrGet)", async () => {
    const fetcher = vi.fn().mockResolvedValue({ v: 1 });

    const value = await swrGet("k1", 5000, fetcher);

    expect(value).toEqual({ v: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(getCached("k1")).toEqual({ v: 1 });
  });

  it("cache hit -> returns cached immediately and revalidates in background", async () => {
    // Prime cache
    setCached("k2", { v: 1 }, 5000);

    const fetcher = vi.fn().mockResolvedValue({ v: 2 });

    const value = await swrGet("k2", 5000, fetcher);

    // Immediate cached value
    expect(value).toEqual({ v: 1 });
    // Background revalidate was kicked
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Allow background promise to resolve and update cache
    await flush();

    expect(getCached("k2")).toEqual({ v: 2 });
  });

  it("expiry -> entry is evicted when TTL elapsed", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    setCached("k3", { v: 1 }, 1000);
    expect(getCached("k3")).toEqual({ v: 1 });

    // Advance virtual time beyond expiry
    vi.spyOn(Date, "now").mockReturnValue(now + 1500);

    expect(getCached("k3")).toBeNull();
  });

  it("error during background revalidate does not throw and keeps cached value", async () => {
    setCached("k4", { v: 1 }, 5000);

    const error = new Error("boom");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetcher = vi.fn().mockRejectedValue(error);

    const value = await swrGet("k4", 5000, fetcher);

    expect(value).toEqual({ v: 1 });
    // Background revalidate attempted and failed
    expect(fetcher).toHaveBeenCalledTimes(1);
    await flush();
    expect(warnSpy).toHaveBeenCalled();
    // Cache unchanged
    expect(getCached("k4")).toEqual({ v: 1 });
  });
});
