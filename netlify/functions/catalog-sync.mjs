import { getStore } from '@netlify/blobs';

const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const EVENTS_KEY = 'eventConnect.events';

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

function addHours(date, time, hours) {
  const value = new Date(`${date || new Date().toISOString().slice(0, 10)}T${time || '19:00'}`);
  if (Number.isNaN(value.getTime())) {
    return '22:00';
  }

  value.setHours(value.getHours() + hours);
  return value.toTimeString().slice(0, 5);
}

function createCatalogEventId(source, sourceId) {
  return `${source}-${String(sourceId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function getBestImage(images = []) {
  return [...images]
    .sort((first, second) => (second.width || 0) - (first.width || 0))
    .find((image) => image.url)?.url || '';
}

function normalizeTicketmasterEvent(event, adminEmail) {
  const venue = event._embedded?.venues?.[0];
  const city = venue?.city?.name || '';
  const state = venue?.state?.stateCode || venue?.state?.name || '';
  const country = venue?.country?.countryCode || venue?.country?.name || '';
  const location = [venue?.name, city, state, country].filter(Boolean).join(', ');
  const startDate = event.dates?.start?.localDate || new Date().toISOString().slice(0, 10);
  const startTime = event.dates?.start?.localTime?.slice(0, 5) || '19:00';
  const sourceId = event.id || `${event.name}-${startDate}`;

  return {
    id: createCatalogEventId('ticketmaster', sourceId),
    name: event.name || 'Untitled public event',
    description: event.info || event.pleaseNote || event.description || 'Public event imported from Ticketmaster.',
    startDate,
    startTime,
    endDate: startDate,
    endTime: addHours(startDate, startTime, 3),
    location,
    type: 'leisure',
    inviteEmails: [],
    organizerEmail: adminEmail,
    managerEmails: [],
    source: 'ticketmaster',
    sourceId,
    sourceUrl: event.url || '',
    sourceImage: getBestImage(event.images),
    closedAt: '',
    closedBy: '',
    deletedAt: '',
    deletedBy: '',
    createdAt: '',
    updatedAt: '',
    tasks: [
      {
        id: 'meet-three-attendees-0',
        name: 'Meet three attendees',
        description: 'Connect with three people at this event.',
        exp: 30
      },
      {
        id: 'share-a-favorite-moment-1',
        name: 'Share a favorite moment',
        description: 'Find someone new and share what you enjoyed most.',
        exp: 20
      }
    ]
  };
}

function mergeEvents(existing, incoming) {
  const events = new Map();
  [...(existing || []), ...(incoming || [])].forEach((event) => {
    if (!event?.id) {
      return;
    }

    const current = events.get(event.id) || {};
    const currentTime = Date.parse(current.updatedAt || current.createdAt || 0) || 0;
    const eventTime = Date.parse(event.updatedAt || event.createdAt || 0) || 0;
    const latest = eventTime >= currentTime ? event : current;
    const earliest = eventTime >= currentTime ? current : event;
    events.set(event.id, {
      ...earliest,
      ...latest,
      closedAt: current.closedAt || event.closedAt || '',
      closedBy: current.closedBy || event.closedBy || '',
      deletedAt: current.deletedAt || event.deletedAt || '',
      deletedBy: current.deletedBy || event.deletedBy || ''
    });
  });

  return Array.from(events.values());
}

function monthsFromNow(months) {
  const value = new Date();
  value.setMonth(value.getMonth() + months);
  return value;
}

async function fetchTicketmasterPage(apiKey, page, startDate, endDate) {
  const params = new URLSearchParams({
    apikey: apiKey,
    size: '50',
    page: String(page),
    sort: 'date,asc',
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`
  });

  const countryCode = process.env.CATALOG_COUNTRY_CODE;
  const city = process.env.CATALOG_CITY;
  const segmentName = process.env.CATALOG_SEGMENT || 'Music';

  if (countryCode) {
    params.set('countryCode', countryCode);
  }

  if (city) {
    params.set('city', city);
  }

  if (segmentName) {
    params.set('segmentName', segmentName);
  }

  const ticketmasterResponse = await fetch(`${TICKETMASTER_API_URL}?${params.toString()}`);
  const data = await ticketmasterResponse.json().catch(() => ({}));

  if (!ticketmasterResponse.ok) {
    throw new Error(data.fault?.faultstring || data.message || 'Ticketmaster catalog sync failed.');
  }

  return data._embedded?.events || [];
}

export default async (request) => {
  if (request?.method === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (request?.method && request.method !== 'GET' && request.method !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return response(500, {
      error: 'Catalog sync is not configured. Set TICKETMASTER_API_KEY in Netlify environment variables.'
    });
  }

  const adminEmail = process.env.CATALOG_ADMIN_EMAIL || 'catalog-admin@eventconnect.local';
  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = monthsFromNow(3).toISOString().slice(0, 10);
  const maxPages = Math.max(1, Math.min(Number(process.env.CATALOG_SYNC_PAGES || 3), 5));
  const pages = Array.from({ length: maxPages }, (_, index) => index);

  const pageResults = await Promise.all(pages.map((page) => (
    fetchTicketmasterPage(apiKey, page, startDate, endDate)
  )));
  const importedEvents = pageResults
    .flat()
    .map((event) => normalizeTicketmasterEvent(event, adminEmail));

  const store = getStore('event-connect-state');
  const existingEvents = await store.get(EVENTS_KEY, { type: 'json' }).catch(() => []);
  const existingIds = new Set((existingEvents || []).map((event) => event.id));
  const mergedEvents = mergeEvents(existingEvents || [], importedEvents);

  await store.setJSON(EVENTS_KEY, mergedEvents);

  return response(200, {
    ok: true,
    adminEmail,
    window: { startDate, endDate },
    fetched: importedEvents.length,
    added: importedEvents.filter((event) => !existingIds.has(event.id)).length,
    total: mergedEvents.length
  });
};

export const config = {
  path: '/.netlify/functions/catalog-sync',
  schedule: '0 */6 * * *'
};
