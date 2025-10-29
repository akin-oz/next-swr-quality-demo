import { NextRequest } from "next/server";
import ITEMS from "@/mocks/items.json";

export async function GET(_req: NextRequest) {
  void _req;
  return Response.json({ data: ITEMS });
}
