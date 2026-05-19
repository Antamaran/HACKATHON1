import { syncCatalog } from '../catalog-core.mjs';

export default async () => {
  try {
    console.log('Catalog scheduled sync started');
    const result = await syncCatalog();
    console.log('Catalog scheduled sync finished', result);
  } catch (error) {
    console.error('Catalog scheduled sync failed', error);
  }
};

export const config = {
  schedule: '0 */6 * * *'
};
