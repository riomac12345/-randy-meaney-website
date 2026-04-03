const { getStore } = require('@netlify/blobs');

const DEFAULT_DATA = {
  products: [],
  settings: {
    contactEmail: '',
    instagramUrl: 'https://www.instagram.com/randy.meaney/',
    facebookUrl:  'https://www.facebook.com/randy.arnold.meaney',
    aboutPhoto:   '',
    aboutText:    "I think I am a natural born maker / creator / concoctor of things. I am not great at learning anything super complex, but just park me in front of some beads or yarn or wire? metal? chain? string? and the magic just begins. Lots of times the materials somehow migrate toward the things they are best paired with. In that case, I am just happily the keeper of the mess while the process is doing its thing.",
    shopsText:    "Sisters Gifts and Home\n349 Bell Street, Los Alamos\n\nLos Alamos Gallery\n515 Bell Street, Los Alamos\n\nThe Yes Store\n1100 State Street, Santa Barbara",
    specialOrdersText: "I am always open to talking about special projects and jewelry repairs. Contact me at randymeaney@gmail.com or call me at 805-680-6522.",
    returnsText:  "Returns are accepted within 30 days of their ship date. Items must be in new, sellable condition. Customers are responsible for shipping costs for returned goods. If the item was sold with 'free shipping' I will deduct my original shipping costs from the refund. Please contact me before you ship any items back.",
  },
};

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const store = getStore({
      name:   'shop-data',
      siteID: process.env.NETLIFY_SITE_ID,
      token:  process.env.NETLIFY_TOKEN,
    });
    const data = await store.get('products', { type: 'json' });
    return { statusCode: 200, headers, body: JSON.stringify(data || DEFAULT_DATA) };
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify(DEFAULT_DATA) };
  }
};
