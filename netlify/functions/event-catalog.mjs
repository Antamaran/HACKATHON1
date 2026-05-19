const TICKETMASTER_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

function response(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
  });
}

function toIsoDateTime(date, endOfDay = false) {
  if (!date) {
    return '';
  }

  return `${date}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
}

function addHours(date, time, hours) {
  const baseDate = date || new Date().toISOString().slice(0, 10);
  const baseTime = time || '19:00:00';
  const value = new Date(`${baseDate}T${baseTime}`);

  if (Number.isNaN(value.getTime())) {
    return '22:00';
  }

  value.setHours(value.getHours() + hours);
  return value.toTimeString().slice(0, 5);
}

function getBestImage(images = []) {
  return [...images]
    .sort((first, second) => (second.width || 0) - (first.width || 0))
    .find((image) => image.url)?.url || '';
}

function normalizeTicketmasterEvent(event) {
  const venue = event._embedded?.venues?.[0];
  const city = venue?.city?.name || '';
  const country = venue?.country?.countryCode || venue?.country?.name || '';
  const state = venue?.state?.stateCode || venue?.state?.name || '';
  const locationParts = [
    venue?.name,
    city,
    state,
    country
  ].filter(Boolean);
  const startDate = event.dates?.start?.localDate || '';
  const startTime = event.dates?.start?.localTime?.slice(0, 5) || '';

  return {
    source: 'ticketmaster',
    sourceId: event.id,
    name: event.name || 'Untitled public event',
    description: event.info || event.pleaseNote || event.description || 'Public event imported from Ticketmaster.',
    startDate,
    startTime: startTime || '19:00',
    endDate: startDate,
    endTime: addHours(startDate, startTime, 3),
    location: locationParts.join(', '),
    venue: venue?.name || '',
    city,
    country,
    url: event.url || '',
    image: getBestImage(event.images),
    category: event.classifications?.[0]?.segment?.name || ''
  };
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (request.method !== 'GET') {
    return response(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return response(500, {
      error: 'Event catalog is not configured. Set TICKETMASTER_API_KEY in Netlify environment variables.'
    });
  }

  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword')?.trim();
  if (!keyword) {
    return response(400, { error: 'Search keyword is required.' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 6);

  const params = new URLSearchParams({
    apikey: apiKey,
    keyword,
    size: '12',
    sort: 'date,asc',
    startDateTime: toIsoDateTime(url.searchParams.get('startDate') || today),
    endDateTime: toIsoDateTime(url.searchParams.get('endDate') || defaultEnd.toISOString().slice(0, 10), true)
  });

  const city = url.searchParams.get('city')?.trim();
  const countryCode = url.searchParams.get('countryCode')?.trim().toUpperCase();

  if (city) {
    params.set('city', city);
  }

  if (countryCode) {
    params.set('countryCode', countryCode);
  }

  const catalogResponse = await fetch(`${TICKETMASTER_API_URL}?${params.toString()}`);
  const data = await catalogResponse.json().catch(() => ({}));

  if (!catalogResponse.ok) {
    return response(catalogResponse.status, {
      error: data.fault?.faultstring || data.message || 'Ticketmaster catalog search failed.'
    });
  }

  const events = (data._embedded?.events || []).map(normalizeTicketmasterEvent);
  return response(200, { events });
};

export const config = {
  path: '/.netlify/functions/event-catalog'
};
