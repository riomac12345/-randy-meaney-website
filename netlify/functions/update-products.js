const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { password, data } = JSON.parse(event.body || '{}');
    const correct = process.env.ADMIN_PASSWORD;

    if (!correct) return { statusCode: 500, body: JSON.stringify({ error: 'ADMIN_PASSWORD not set' }) };
    if (password !== correct) return { statusCode: 401, body: 'Unauthorized' };
    if (!data || !Array.isArray(data.products)) return { statusCode: 400, body: 'Invalid data' };

    const store = getStore({
      name:   'shop-data',
      siteID: process.env.NETLIFY_SITE_ID,
      token:  process.env.NETLIFY_TOKEN,
    });

    await store.setJSON('products', data);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
