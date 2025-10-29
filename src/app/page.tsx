"use client";

import Link from "next/link";
import Alert from "@/components/Alert";
import { useQuery } from "@/hooks/useQuery";
import { listItems } from "@/domain/items";
import type { Item } from "@/lib/models";
import { toUserError } from "@/lib/error-message";

export default function HomePage() {
  const { data, status, error } = useQuery<Item[]>("items:list", () =>
    listItems(),
  );

  const userErr = status === "error" ? toUserError(error) : null;

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Items</h1>

      {status === "loading" && <p>Loading…</p>}

      {status === "error" && userErr && (
        <Alert title={userErr.title} severity={userErr.severity}>
          {userErr.description}
        </Alert>
      )}

      {status === "empty" && <p>No items yet.</p>}

      {status === "success" && data && (
        <ul className="space-y-2">
          {data.map((item: Item) => (
            <li key={String(item.id)}>
              <Link
                href={`/items/${encodeURIComponent(String(item.id))}`}
                className="text-blue-600 underline"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
