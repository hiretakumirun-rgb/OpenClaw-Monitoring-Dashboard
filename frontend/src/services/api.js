export const generateKey = () =>
  fetch('/api/keys', { method: 'POST' }).then((r) => r.json());

export const trackEvent = (payload) =>
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const getDashboard = (key) =>
  fetch(`/api/dashboard/${key}`).then((r) => r.json());