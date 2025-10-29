// ~/src/lib/logger.ts
type Level = "debug" | "info" | "warn" | "error";

const defaultEnabled: Record<Level, boolean> = {
  debug: process.env.NODE_ENV !== "production",
  info: true,
  warn: true,
  error: true,
};

let enabled = { ...defaultEnabled };

export function setLogLevel(overrides: Partial<Record<Level, boolean>>) {
  enabled = { ...enabled, ...overrides };
}

const consoleMap: Record<Level, (...x: unknown[]) => void> = {
  debug: (...x) => console.debug(...x),
  info: (...x) => console.info(...x),
  warn: (...x) => console.warn(...x),
  error: (...x) => console.error(...x),
};

export const logger = Object.fromEntries(
  (Object.keys(consoleMap) as Level[]).map((level) => [
    level,
    (...args: unknown[]) => {
      if (enabled[level]) consoleMap[level](...args);
    },
  ]),
) as Record<Level, (...args: unknown[]) => void>;
