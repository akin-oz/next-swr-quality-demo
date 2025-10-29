import { logger } from "@/lib/logger";

export async function startMSW() {
  // Ensure this only runs in the browser and during development
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;

  try {
    const [{ setupWorker }, { handlers }] = await Promise.all([
      import("msw/browser"),
      import("./handlers"),
    ]);

    const worker = setupWorker(...handlers);
    await worker.start({ onUnhandledRequest: "bypass" });
    logger.info("[msw] Service worker started");
  } catch (e) {
    logger.warn("[msw] Failed to start worker", e);
  }
}
