import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuery } from "@/hooks/useQuery";
import { clearCache, getCached } from "@/lib/cache";

function flush() {
  return new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
  clearCache();
  vi.clearAllMocks();
});

describe("useQuery", () => {
  it("returns loading then success with data", async () => {
    const fetcher = vi.fn(async () => ({ id: 1, name: "Ada" }));

    const { result } = renderHook(() => useQuery("user:1", fetcher, 1000));

    expect(result.current.status).toBe("loading");
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await flush();
    });

    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({ id: 1, name: "Ada" });
    expect(getCached("user:1")).toEqual({ id: 1, name: "Ada" });
  });

  it("empty array triggers empty state", async () => {
    const fetcher = vi.fn(async () => []);

    const { result } = renderHook(() => useQuery("list:empty", fetcher, 1000));

    await act(async () => {
      await flush();
    });

    expect(result.current.status).toBe("empty");
  });

  it("cache hit returns success immediately and revalidates", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ id: 2, name: "Babbage" })
      .mockResolvedValueOnce({ id: 2, name: "Updated" });

    // Prime cache
    {
      const { unmount } = renderHook(() => useQuery("user:2", fetcher, 5000));
      await act(async () => {
        await flush();
      });
      unmount();
    }

    expect(getCached("user:2")).toEqual({ id: 2, name: "Babbage" });

    const { result } = renderHook(() => useQuery("user:2", fetcher, 5000));

    // Should return cached immediately
    expect(result.current.status).toBe("success");
    expect(result.current.data).toEqual({ id: 2, name: "Babbage" });

    await act(async () => {
      await flush();
    });

    // Revalidated
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(getCached("user:2")).toEqual({ id: 2, name: "Updated" });
  });

  it("aborts fetch on unmount", async () => {
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn((s?: AbortSignal) => {
      signal = s;
      return new Promise(() => {}); // never resolves
    });

    const { unmount } = renderHook(() => useQuery("slow", fetcher, 1000));

    expect(signal).toBeDefined();
    expect(signal!.aborted).toBe(false);

    unmount();

    expect(signal!.aborted).toBe(true);
  });
});
