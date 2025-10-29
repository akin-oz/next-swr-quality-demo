import { describe, it, expect } from "vitest";
import { listItems, getItem } from "@/domain/items";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../setup/msw.setup";

describe("domain/items", () => {
  it("listItems returns validated items", async () => {
    server.use(
      mswHttp.get("/api/items", () => {
        return HttpResponse.json({ data: [{ id: 1, title: "A" }] });
      }),
    );

    const result = await listItems();

    expect(result).toEqual([{ id: 1, title: "A" }]);
  });

  it("listItems throws validation error on wrong payload", async () => {
    server.use(
      mswHttp.get("/api/items", () => {
        return HttpResponse.json({ items: [] }); // wrong shape
      }),
    );

    await expect(listItems()).rejects.toMatchObject({
      type: "validation",
    });
  });

  it("getItem returns validated item", async () => {
    server.use(
      mswHttp.get("/api/items/:id", () => {
        return HttpResponse.json({ data: { id: 2, title: "B" } });
      }),
    );

    const result = await getItem("2");

    expect(result).toEqual({ id: 2, title: "B" });
  });

  it("getItem throws validation error on invalid payload", async () => {
    server.use(
      mswHttp.get("/api/items/:id", () => {
        return HttpResponse.json({ id: 3 }); // missing title & no envelope
      }),
    );

    await expect(getItem("3")).rejects.toMatchObject({
      type: "validation",
    });
  });
});
