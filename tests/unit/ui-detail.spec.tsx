import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ItemDetailPage from "@/app/items/[id]/page";
import { http as mswHttp, HttpResponse } from "msw";
import { server } from "../setup/msw.setup";

function renderWithParams(id: string) {
  // For tests, pass a plain params object to avoid Suspense from use(params)
  return render(<ItemDetailPage params={{ id }} />);
}

describe("ItemDetailPage UI states", () => {
  it("shows success for found item", async () => {
    server.use(
      mswHttp.get("/api/items/:id", ({ params }) => {
        const id = Number(params.id);
        return HttpResponse.json({ data: { id, title: `Title ${id}` } });
      }),
    );

    renderWithParams("2");

    expect(await screen.findByText(/Title 2/)).toBeInTheDocument();
  });

  it("shows 404 warning variant when not found", async () => {
    server.use(
      mswHttp.get("/api/items/:id", () => {
        return HttpResponse.json({ message: "Not Found" }, { status: 404 });
      }),
    );

    renderWithParams("999");

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Not Found/i);
    expect(alert).toHaveTextContent(/No item with id 999/i);
  });

  it("shows generic error variant when server fails", async () => {
    server.use(mswHttp.get("/api/items/:id", () => HttpResponse.error()));

    renderWithParams("9999");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Failed to load/i);
    expect(alert).not.toHaveTextContent(/Not Found/i);
  });
});
