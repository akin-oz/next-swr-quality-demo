import { NextRequest } from "next/server";
import ITEMS from "@/mocks/items.json";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  const item = ITEMS.find((i) => i.id === numId);

  if (!item) {
    return Response.json({ message: "Not Found" }, { status: 404 });
  }

  return Response.json({ data: item });
}
