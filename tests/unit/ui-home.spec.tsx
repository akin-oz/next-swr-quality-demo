import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { http as mswHttp, HttpResponse, delay } from "msw";
import { server } from "../setup/msw.setup";

describe("HomePage UI states", () => {
  it("shows loading then success with list items", async () => {
    server.use(
      mswHttp.get("/api/items", async () => {
        await delay(50);
        return HttpResponse.json({ data: [{ id: 1, title: "A" }] });
      }),
    );

    render(<HomePage />);

    // Loading first
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Then success
    expect(await screen.findByText("A")).toBeInTheDocument();
  });

  it("shows empty state when API returns empty array", async () => {
    server.use(
      mswHttp.get("/api/items", () => {
        return HttpResponse.json({ data: [] });
      }),
    );

    render(<HomePage />);

    expect(await screen.findByText(/No items yet/i)).toBeInTheDocument();
  });

  it("shows error state on server error", async () => {
    server.use(
      mswHttp.get("/api/items", () => {
        return HttpResponse.json({ message: "Boom" }, { status: 500 });
      }),
    );

    render(<HomePage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    // Copy path: component shows generic if error is not instance of Error
    expect(alert).toHaveTextContent(/Failed to load/i);
  });
});
