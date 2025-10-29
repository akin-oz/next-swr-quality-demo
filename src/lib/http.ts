import { z } from "zod";
import { createAppError, isAppError } from "./models";
import { logger } from "./logger";

type Options<T> = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  schema?: z.ZodType<T>;
};

const jsonCT = "application/json";

function wantsJson(res: Response) {
  return (res.headers.get("content-type") ?? "").includes(jsonCT);
}

async function readJson(res: Response) {
  try {
    return await res.json();
  } catch (e) {
    throw createAppError("parse", "Invalid JSON response", { cause: e });
  }
}

async function readMessage(res: Response, fallback: string) {
  if (wantsJson(res)) {
    try {
      const body = await res.json();
      if (typeof body === "object" && body && "message" in body) {
        return String(body.message);
      }
    } catch (e) {
      logger.debug("[http] Failed to read JSON error body", { cause: e });
    }
  }

  try {
    const text = await res.text();
    return text || fallback;
  } catch (e) {
    logger.debug("[http] Failed to read text error body", { cause: e });
    return fallback;
  }
}

function mapCaught(err: unknown): never {
  if (err instanceof DOMException && err.name === "AbortError") {
    throw createAppError("aborted", "Request aborted", { cause: err });
  }
  if (isAppError(err)) throw err;
  throw createAppError("network", "Network error", { cause: err });
}

export async function http<T = unknown>(
  url: string,
  opts: Options<T> = {},
): Promise<T> {
  const controller = new AbortController();
  const signal = opts.signal ?? controller.signal;
  const method = opts.method ?? (opts.body ? "POST" : "GET");

  const headers: Record<string, string> = {
    ...(opts.headers ?? {}),
  };

  // Only set Content-Type for requests with a body and if not already provided
  if (opts.body !== undefined) {
    const hasContentType = Object.keys(headers).some(
      (k) => k.toLowerCase() === "content-type",
    );
    if (!hasContentType) {
      headers["Content-Type"] = jsonCT;
    }
  }

  const init: RequestInit = {
    method,
    headers,
    signal,
  };

  if (opts.body !== undefined) {
    init.body =
      typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }

  try {
    const res = await fetch(url, init);

    if (!res.ok) {
      const msg = await readMessage(
        res,
        `Request failed with status ${res.status}`,
      );
      throw createAppError("http", msg, { status: res.status });
    }

    if (res.status === 204) {
      return undefined as T;
    }

    if (!wantsJson(res)) {
      const text = await res.text();
      if (!text.trim()) return undefined as unknown as T;
      throw createAppError(
        "parse",
        "Expected JSON but got another content type",
      );
    }

    const data = await readJson(res);

    if (opts.schema) {
      const res = opts.schema.safeParse(data);
      if (!res.success) {
        throw createAppError("validation", res.error.message);
      }
      return res.data;
    }

    return data as T;
  } catch (err) {
    return mapCaught(err);
  }
}

export function createAbortController() {
  return new AbortController();
}
