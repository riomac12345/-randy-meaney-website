exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { password } = JSON.parse(event.body || '{}');
    const correct      = process.env.ADMIN_PASSWORD;

    if (!correct) {
      return { statusCode: 500, body: 'Admin password not configured.' };
    }

    if (password !== correct) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 400, body: 'Bad request' };
  }
};
