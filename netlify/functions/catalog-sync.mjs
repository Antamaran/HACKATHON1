import { syncCatalog } from '../catalog-core.mjs';

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

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  try {
    return response(200, await syncCatalog());
  } catch (error) {
    return response(500, { error: error.message || 'Catalog sync failed.' });
  }
};

export const config = {
  path: '/.netlify/functions/catalog-sync'
};
