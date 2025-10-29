'use client';
import { useEffect } from 'react';
import { startMSW } from '@/mocks/browser';

// Client-only component that starts MSW in development. Renders nothing.
export default function MSWProvider() {
  useEffect(() => {
    // Fire-and-forget; errors are internally handled
    // Only runs in development and in the browser
    void startMSW();
  }, []);
  return null;
}
