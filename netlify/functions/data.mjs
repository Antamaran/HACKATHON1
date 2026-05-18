import { getStore } from '@netlify/blobs';

const allowedKeys = new Set([
  'eventConnect.users',
  'eventConnect.events',
  'eventConnect.registrations',
  'eventConnect.eventParticipants',
  'eventConnect.taskCompletions',
  'eventConnect.eventRewards',
  'eventConnect.notifications'
]);

function response(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
  });
}

function uniqueArray(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function mergeArraysById(existing, incoming, idField) {
  const items = new Map();

  [...(existing || []), ...(incoming || [])].forEach((item) => {
    if (!item || !item[idField]) {
      return;
    }

    items.set(item[idField], {
      ...(items.get(item[idField]) || {}),
      ...item
    });
  });

  return Array.from(items.values());
}

function mergeRegistrations(existing, incoming) {
  const merged = { ...(existing || {}) };

  Object.entries(incoming || {}).forEach(([eventId, emails]) => {
    merged[eventId] = uniqueArray([...(merged[eventId] || []), ...(emails || [])]);
  });

  return merged;
}

function mergeTaskCompletions(existing, incoming) {
  const merged = { ...(existing || {}) };

  Object.entries(incoming || {}).forEach(([eventId, tasks]) => {
    merged[eventId] = { ...(merged[eventId] || {}) };

    Object.entries(tasks || {}).forEach(([taskId, completion]) => {
      const current = merged[eventId][taskId] || {};
      merged[eventId][taskId] = {
        pending: uniqueArray([...(current.pending || []), ...(completion.pending || [])]),
        approved: uniqueArray([...(current.approved || []), ...(completion.approved || [])])
      };
    });
  });

  return merged;
}

function mergeParticipants(existing, incoming) {
  const participants = new Map();

  [...(existing || []), ...(incoming || [])].forEach((participant) => {
    if (!participant?.id) {
      return;
    }

    const current = participants.get(participant.id) || {};
    participants.set(participant.id, {
      ...current,
      ...participant,
      eventXp: Math.max(Number(current.eventXp || 0), Number(participant.eventXp || 0)),
      connectedParticipantIds: uniqueArray([
        ...(current.connectedParticipantIds || []),
        ...(participant.connectedParticipantIds || [])
      ])
    });
  });

  return Array.from(participants.values());
}

function mergeUsers(existing, incoming) {
  const users = new Map();

  [...(existing || []), ...(incoming || [])].forEach((user) => {
    if (!user?.email) {
      return;
    }

    const current = users.get(user.email) || {};
    users.set(user.email, {
      ...current,
      ...user,
      exp: Math.max(Number(current.exp || 0), Number(user.exp || 0)),
      connectedUsers: uniqueArray([
        ...(current.connectedUsers || []),
        ...(user.connectedUsers || [])
      ])
    });
  });

  return Array.from(users.values());
}

function mergeValue(key, existing, incoming) {
  if (key === 'eventConnect.events') {
    return mergeArraysById(existing, incoming, 'id');
  }

  if (key === 'eventConnect.users') {
    return mergeUsers(existing, incoming);
  }

  if (key === 'eventConnect.eventParticipants') {
    return mergeParticipants(existing, incoming);
  }

  if (key === 'eventConnect.registrations') {
    return mergeRegistrations(existing, incoming);
  }

  if (key === 'eventConnect.taskCompletions') {
    return mergeTaskCompletions(existing, incoming);
  }

  if (key === 'eventConnect.eventRewards' || key === 'eventConnect.notifications') {
    return Array.isArray(existing) || Array.isArray(incoming)
      ? mergeArraysById(existing, incoming, 'id')
      : { ...(existing || {}), ...(incoming || {}) };
  }

  return incoming;
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return response(200, { ok: true });
  }

  const store = getStore('event-connect-state');

  if (request.method === 'GET') {
    const state = {};

    await Promise.all(Array.from(allowedKeys).map(async (key) => {
      state[key] = await store.get(key, { type: 'json' }).catch(() => null);
    }));

    return response(200, { state });
  }

  if (request.method === 'POST') {
    let payload;
    try {
      payload = JSON.parse(await request.text());
    } catch {
      return response(400, { error: 'Invalid JSON body' });
    }

    if (!allowedKeys.has(payload.key)) {
      return response(400, { error: 'Unsupported storage key' });
    }

    const existing = await store.get(payload.key, { type: 'json' }).catch(() => null);
    const merged = mergeValue(payload.key, existing, payload.value);

    await store.setJSON(payload.key, merged);
    return response(200, { ok: true, value: merged });
  }

  return response(405, { error: 'Method not allowed' });
};

export const config = {
  path: '/.netlify/functions/data'
};
