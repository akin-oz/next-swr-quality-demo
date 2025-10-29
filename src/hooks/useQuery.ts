"use client";
import { useEffect, useRef, useState } from "react";
import { getCached, setCached } from "@/lib/cache";
import { DEFAULT_TTL_MS } from "@/config";

export type Status = "loading" | "success" | "empty" | "error";

type Options = { ttl?: number };
type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

export function useQuery<T>(
  key: string,
  fetcher: Fetcher<T>,
  options?: number | Options,
) {
  const ttlMs =
    typeof options === "number" ? options : (options?.ttl ?? DEFAULT_TTL_MS);

  const initial = getCached<T>(key);
  const [data, setData] = useState<T | null>(initial);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<Status>(initial ? "success" : "loading");

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetcher(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;

        if (value == null || (Array.isArray(value) && value.length === 0)) {
          setStatus("empty");
          return;
        }

        setCached(key, value, ttlMs);
        setData(value);
        setStatus("success");
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e);
        setStatus("error");
      });

    return () => controller.abort();
  }, [key, fetcher, ttlMs]);

  return { data, error, status } as const;
}
