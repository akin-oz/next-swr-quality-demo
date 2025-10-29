"use client";

import Alert from "@/components/Alert";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>

      <Alert title="Unexpected error">
        <p>{error.message || "An unknown error occurred."}</p>
        {error.digest && (
          <p className="text-xs opacity-70">Ref: {error.digest}</p>
        )}
      </Alert>

      <button
        onClick={reset}
        className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </main>
  );
}
