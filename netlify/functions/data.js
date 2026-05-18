const { getStore } = require('@netlify/blobs');

const allowedKeys = new Set([
  'eventConnect.users',
  'eventConnect.events',
  'eventConnect.registrations',
  'eventConnect.taskCompletions',
  'eventConnect.eventRewards',
  'eventConnect.notifications'
]);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const store = getStore('event-connect-state');

  if (event.httpMethod === 'GET') {
    const state = {};

    await Promise.all(Array.from(allowedKeys).map(async (key) => {
      state[key] = await store.get(key, { type: 'json' });
    }));

    return json(200, { state });
  }

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }

    if (!allowedKeys.has(payload.key)) {
      return json(400, { error: 'Unsupported storage key' });
    }

    await store.setJSON(payload.key, payload.value);
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
