import { z } from "zod";
import { http } from "@/lib/http";
import { ApiEnvelope, ItemSchema, type Item } from "@/lib/models";
import { ITEMS_BASE_URL } from "@/config";

export type ListItemsResponse = Item[];
export type GetItemResponse = Item;

const ListItemsEnvelope = ApiEnvelope(z.array(ItemSchema));
const GetItemEnvelope = ApiEnvelope(ItemSchema);

const BASE_URL = ITEMS_BASE_URL;

export async function listItems(): Promise<ListItemsResponse> {
  const env = await http<{ data: Item[] }>(BASE_URL, {
    schema: ListItemsEnvelope,
  });
  return env.data;
}

export async function getItem(id: string | number): Promise<GetItemResponse> {
  const env = await http<{ data: Item }>(`${BASE_URL}/${id}`, {
    schema: GetItemEnvelope,
  });
  return env.data;
}
