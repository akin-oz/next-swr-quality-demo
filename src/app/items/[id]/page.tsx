'use client';

import { use } from 'react';
import Link from 'next/link';
import Alert from '@/components/Alert';
import { useQuery } from '@/hooks/useQuery';
import { getItem } from '@/lib/queries';
import type { AppError } from '@/lib/models';
import { toUserError } from '@/lib/error-message';

function isThenable<T>(v: unknown): v is PromiseLike<T> {
  const maybe = v as { then?: unknown };
  return typeof maybe?.then === 'function';
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = isThenable<{ id: string }>(params) ? use(params) : params;
  const id = decodeURIComponent(resolved.id);
  const { data, status, error } = useQuery(`items:${id}`, () => getItem(id, 5000));

  const err = error as AppError | undefined;
  const isNotFound = err?.type === 'http' && err.status === 404;
  const userErr = status === 'error' && !isNotFound ? toUserError(error) : null;

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Item Detail</h1>
        <Link href=".." className="text-blue-600 underline">
          ← Back
        </Link>
      </div>

      {status === 'loading' && <p>Loading…</p>}

      {status === 'error' && (
        <Alert title={isNotFound ? 'Not Found' : userErr?.title} severity={isNotFound ? 'warning' : userErr?.severity}>
          {isNotFound ? `No item with id ${id}` : userErr?.description ?? 'Unknown error'}
        </Alert>
      )}

      {status === 'empty' && <p>No data for this item.</p>}

      {status === 'success' && data && (
        <article className="rounded border p-4 space-y-2">
          <div className="text-sm text-zinc-500">ID: {data.id}</div>
          <h2 className="text-lg font-medium">{data.title}</h2>
          <div>Status: {data.completed ? 'Completed' : 'Pending'}</div>
        </article>
      )}
    </main>
  );
}