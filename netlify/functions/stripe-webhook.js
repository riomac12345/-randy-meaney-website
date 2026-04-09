const Stripe       = require('stripe');
const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripe        = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig           = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify the event came from Stripe
  let stripeEvent;
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Only handle successful checkouts
  if (stripeEvent.type === 'checkout.session.completed') {
    try {
      const session   = stripeEvent.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      // Collect the names of everything purchased
      const purchasedNames = lineItems.data
        .map(item => item.description)
        .filter(Boolean)
        .map(n => n.toLowerCase().trim());

      if (purchasedNames.length === 0) {
        return { statusCode: 200, body: JSON.stringify({ received: true }) };
      }

      // Load current shop data and mark matching products as sold
      const store = getStore({
        name:   'shop-data',
        siteID: process.env.NETLIFY_SITE_ID,
        token:  process.env.NETLIFY_TOKEN,
      });

      const data = await store.get('products', { type: 'json' });
      if (data && Array.isArray(data.products)) {
        let changed = false;
        data.products = data.products.map(product => {
          if (purchasedNames.includes((product.name || '').toLowerCase().trim())) {
            changed = true;
            return { ...product, sold: true };
          }
          return product;
        });

        if (changed) {
          await store.setJSON('products', data);
        }
      }
    } catch (err) {
      // Log but don't fail — the payment already went through
      console.error('Error marking product as sold:', err);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
