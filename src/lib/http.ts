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

const JSON_CT = "application/json";

function wantsJson(res: Response) {
  return (res.headers.get("content-type") ?? "").includes(JSON_CT);
}

function ensureContentType(
  headers: Record<string, string>,
  body: unknown,
): Record<string, string> {
  if (body === undefined) return headers;
  const hasCT = Object.keys(headers).some(
    (k) => k.toLowerCase() === "content-type",
  );
  return hasCT ? headers : { ...headers, "content-type": JSON_CT };
}

function toBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  return typeof body === "string" ? body : JSON.stringify(body);
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
      if (
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof (body as Record<string, unknown>).message === "string"
      ) {
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

async function throwForHttpError(res: Response): Promise<void> {
  if (res.ok) return;
  const msg = await readMessage(
    res,
    `Request failed with status ${res.status}`,
  );
  throw createAppError("http", msg, { status: res.status });
}

async function resolveNonJson<T>(res: Response): Promise<T | undefined> {
  const text = await res.text();
  if (!text.trim()) return undefined as unknown as T;
  throw createAppError("parse", "Expected JSON but got another content type");
}

function validate<T>(data: unknown, schema?: z.ZodType<T>): T {
  if (!schema) return data as T;
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  throw createAppError("validation", r.error.message);
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
  const headers = ensureContentType({ ...(opts.headers ?? {}) }, opts.body);

  const init: RequestInit = {
    method,
    headers,
    signal,
    body: toBody(opts.body),
  };

  try {
    const res = await fetch(url, init);

    await throwForHttpError(res);

    if (res.status === 204) return undefined as T;

    if (!wantsJson(res)) {
      return (await resolveNonJson<T>(res)) as T;
    }

    const data = await readJson(res);
    return validate<T>(data, opts.schema);
  } catch (err) {
    return mapCaught(err);
  }
}

export function createAbortController() {
  return new AbortController();
}
