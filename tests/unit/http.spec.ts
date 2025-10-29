import { describe, it, expect } from "vitest";
import { z } from "zod";
import { http } from "@/lib/http";
import { http as mswHttp, HttpResponse, delay } from "msw";
import { server } from "../setup/msw.setup";

const UserSchema = z.object({ id: z.number(), name: z.string() });

describe("http()", () => {
  it("returns schema-validated data", async () => {
    server.use(
      mswHttp.get("/api/user", () => {
        return HttpResponse.json({ id: 1, name: "Ada" });
      }),
    );

    const result = await http("/api/user", { schema: UserSchema });

    expect(result).toEqual({ id: 1, name: "Ada" });
  });

  it("maps network errors", async () => {
    server.use(
      mswHttp.get("/api/error", () => {
        return HttpResponse.error();
      }),
    );

    await expect(http("/api/error")).rejects.toMatchObject({
      type: "network",
      message: expect.any(String),
    });
  });

  it("maps non-2xx HTTP errors", async () => {
    server.use(
      mswHttp.get("/api/bad", () => {
        return HttpResponse.json({ message: "Bad request" }, { status: 400 });
      }),
    );

    await expect(http("/api/bad")).rejects.toMatchObject({
      type: "http",
      status: 400,
      message: "Bad request",
    });
  });

  it("maps parse errors", async () => {
    server.use(
      mswHttp.get("/api/parse", () => {
        return new HttpResponse("not-json", {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );

    await expect(http("/api/parse")).rejects.toMatchObject({
      type: "parse",
    });
  });

  it("maps validation errors", async () => {
    server.use(
      mswHttp.get("/api/user", () => {
        return HttpResponse.json({ id: 1 }); // missing name
      }),
    );

    await expect(
      http("/api/user", { schema: UserSchema }),
    ).rejects.toMatchObject({ type: "validation" });
  });

  it("maps abort errors", async () => {
    server.use(
      mswHttp.get("/api/slow", async () => {
        await delay(1000);
        return HttpResponse.json({ ok: true });
      }),
    );

    const controller = new AbortController();
    const p = http("/api/slow", { signal: controller.signal });
    controller.abort();
    await expect(p).rejects.toMatchObject({ type: "aborted" });
  });
});
