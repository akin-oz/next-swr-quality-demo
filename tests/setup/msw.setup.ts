import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers as defaultHandlers } from "@/mocks/handlers";

// Create a server instance with default app handlers. Tests can override per-suite.
export const server = setupServer(...defaultHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
