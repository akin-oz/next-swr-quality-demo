/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useQuery } from '../../src/hooks/useQuery';
import { clearCache, getCached } from '../../src/lib/cache';

// Simple test driver component that exposes hook state via callbacks
function Probe<T>(props: {
  onChange: (snapshot: { data: T | null; status: string; error: unknown }) => void;
  run: () => { key: string; fetcher: (signal?: AbortSignal) => Promise<T>; ttl?: number };
}) {
  const { key, fetcher, ttl } = props.run();
  const { data, status, error } = useQuery<T>(key, fetcher, { ttl });
  useEffect(() => {
    props.onChange({ data, status, error });
  }, [data, status, error]);
  return null;
}

function mount(element: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return {
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export async function test_success_and_empty_states() {
  clearCache();

  let last: any = null;
  const onChange = (s: any) => {
    last = s;
  };

  // success case
  const successFetcher = async (_signal?: AbortSignal) => {
    await Promise.resolve(); // microtask
    return { id: 1, name: 'Ada' } as any;
  };

  const app = mount(
    React.createElement(Probe<any>, {
      onChange,
      run: () => ({ key: 'user:1', fetcher: successFetcher, ttl: 1000 }),
    })
  );

  // initial render
  if (!last || last.status !== 'loading') throw new Error('Expected loading initially');

  // wait for success
  await act(async () => {
    await Promise.resolve();
  });
  if (last.status !== 'success' || !last.data || last.data.id !== 1) {
    app.unmount();
    throw new Error('Expected success state with data');
  }

  // empty case
  last = null;
  app.unmount();

  const emptyFetcher = async (_signal?: AbortSignal) => {
    await Promise.resolve();
    return [] as any;
  };

  const app2 = mount(
    React.createElement(Probe<any>, {
      onChange,
      run: () => ({ key: 'list:empty', fetcher: emptyFetcher, ttl: 1000 }),
    })
  );

  // flush
  await act(async () => {
    await Promise.resolve();
  });
  if (!last || last.status !== 'empty') {
    app2.unmount();
    throw new Error('Expected empty state for empty array result');
  }

  app2.unmount();
}

export async function test_cache_hit_then_revalidate() {
  clearCache();

  let last: any = null;
  const onChange = (s: any) => {
    last = s;
  };

  // prime cache
  const key = 'user:2';
  // We avoid direct setCached to ensure hook also sets cache; but here we'll simulate first render fetch and then second render should read from cache

  let calls = 0;
  const fetcher = async (_signal?: AbortSignal) => {
    calls += 1;
    await Promise.resolve();
    return { id: 2, name: 'Babbage' } as any;
  };

  // First mount performs fetch and caches
  const app1 = mount(
    React.createElement(Probe<any>, {
      onChange,
      run: () => ({ key, fetcher, ttl: 5000 }),
    })
  );

  await act(async () => {
    await Promise.resolve();
  });
  if (last.status !== 'success') throw new Error('Expected success after initial fetch');
  app1.unmount();

  const cached = getCached<any>(key);
  if (!cached) throw new Error('Expected value cached after first fetch');

  // Second mount should start in success due to cache hit and still revalidate in background
  const app2 = mount(
    React.createElement(Probe<any>, {
      onChange,
      run: () => ({ key, fetcher, ttl: 5000 }),
    })
  );

  if (last.status !== 'success') {
    app2.unmount();
    throw new Error('Expected immediate success from cache hit');
  }

  // Let any background revalidation complete
  await act(async () => {
    await Promise.resolve();
  });
  if (calls < 2) {
    app2.unmount();
    throw new Error('Expected revalidation call after cache hit');
  }

  app2.unmount();
}

export async function test_abort_on_unmount() {
  clearCache();
  let capturedSignal: AbortSignal | undefined;

  const fetcher = async (signal?: AbortSignal) => {
    capturedSignal = signal;
    // Return a promise that never resolves to simulate in-flight request
    // The abort signal should flip to aborted on unmount
    return new Promise<any>(() => {});
  };

  let last: any = null;
  const onChange = (s: any) => (last = s);

  const app = mount(
    React.createElement(Probe<any>, {
      onChange,
      run: () => ({ key: 'slow', fetcher, ttl: 1000 }),
    })
  );

  if (!capturedSignal) {
    app.unmount();
    throw new Error('Fetcher was not called with AbortSignal');
  }
  if (!last || last.status !== 'loading') {
    app.unmount();
    throw new Error('Expected loading before unmount');
  }

  // Unmount triggers abort
  app.unmount();

  if (!capturedSignal.aborted) throw new Error('Expected signal.aborted to be true after unmount');
}

export const tests = {
  test_success_and_empty_states,
  test_cache_hit_then_revalidate,
  test_abort_on_unmount,
};
