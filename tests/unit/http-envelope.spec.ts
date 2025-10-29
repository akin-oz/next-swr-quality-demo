import { describe, it, expect } from "vitest";
import { z } from "zod";
import { http } from "@/lib/http";
import { ApiEnvelope } from "@/lib/models";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../setup/msw.setup";

describe("http() with ApiEnvelope", () => {
  const User = z.object({ id: z.number(), name: z.string() });
  const UserEnvelope = ApiEnvelope(User);

  it("validates success envelope and returns typed data", async () => {
    server.use(
      mswHttp.get("/api/user2", () => {
        return HttpResponse.json({ data: { id: 7, name: "Grace" } });
      }),
    );

    const result = await http("/api/user2", { schema: UserEnvelope });

    expect(result).toEqual({ data: { id: 7, name: "Grace" } });
  });

  it("throws validation error when envelope shape is wrong (missing data)", async () => {
    server.use(
      mswHttp.get("/api/user2", () => {
        return HttpResponse.json({ id: 7, name: "Grace" });
      }),
    );

    await expect(http("/api/user2", { schema: UserEnvelope })).rejects.toMatchObject({
      type: "validation",
    });
  });
});
