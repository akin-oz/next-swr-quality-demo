import { test, expect, type Page, type Route } from "@playwright/test";

// Mock API data
const items = [
  { id: 1, title: "First Item" },
  { id: 2, title: "Second Item" },
];

const itemById = (id: number) => items.find((i) => i.id === id)!;

// Route mocking helper
async function mockApiRoutes(page: Page) {
  await page.route("**/api/items", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: items }),
    });
  });
  await page.route(/.*\/api\/items\/(\d+)/, async (route: Route) => {
    const url = new URL(route.request().url());
    const idStr = url.pathname.split("/").pop();
    const id = Number(idStr);
    const found = itemById(id);
    await route.fulfill({
      status: found ? 200 : 404,
      contentType: "application/json",
      body: JSON.stringify(found ? { data: found } : { message: "Not Found" }),
    });
  });
}

// Happy path: list -> navigate to detail -> see content
test("list to detail happy path", async ({ page, baseURL }) => {
  await mockApiRoutes(page);

  await page.goto(baseURL || "/");

  await expect(page.getByRole("heading", { name: "Items" })).toBeVisible();

  // Wait for list to render
  await expect(page.getByRole("link", { name: "First Item" })).toBeVisible();

  // Click first item
  await page.getByRole("link", { name: "First Item" }).click();

  // On detail page, assert fields
  await expect(
    page.getByRole("heading", { name: "Item Detail" }),
  ).toBeVisible();
  await expect(page.getByText("ID: 1")).toBeVisible();
  await expect(page.getByRole("heading", { name: "First Item" })).toBeVisible();
});
