/* Minimal placeholder for MSW worker. In real projects, generate via `npx msw init public --save`. */
/* eslint-disable no-restricted-globals */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// No-op handlers to avoid errors if MSW sends messages.
self.addEventListener('message', (event) => {
  // MSW typically sends commands like "CLIENT_READY", "MOCK_ACTIVATE" etc.
  // This placeholder worker doesn't perform request interception.
  // It only exists to prevent 404/500 on /mockServiceWorker.js during registration in dev.
  if (!event?.data) return;
  // Respond with a benign message to keep MSW start sequence from failing noisily.
  if (event.source && 'postMessage' in event.source) {
    try { event.source.postMessage({ type: 'MOCKING_DISABLED' }); } catch (_) {}
  }
});

// This worker does not intercept fetch.
