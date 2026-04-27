const Stripe = require('stripe');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items } = JSON.parse(event.body || '{}');

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: 'Cart is empty' };
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const origin = event.headers.origin || event.headers.referer || 'https://yourdomain.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
          },
          unit_amount: Math.round(parseFloat(item.price) * 100),
        },
        quantity: item.quantity || 1,
      })),
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['US'] },
      automatic_tax: { enabled: true },
      success_url: `${new URL(origin).origin}/success.html`,
      cancel_url:  `${new URL(origin).origin}/`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('create-checkout error:', err);
    return { statusCode: 500, body: 'Failed to create checkout session' };
  }
};
