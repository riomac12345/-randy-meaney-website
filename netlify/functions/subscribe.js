exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body || '{}');
  if (!email) return { statusCode: 400, body: 'Email required' };

  const apiKey      = process.env.MAILCHIMP_API_KEY;
  const audienceId  = process.env.MAILCHIMP_AUDIENCE_ID;
  const datacenter  = apiKey.split('-')[1];

  const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    },
    body: JSON.stringify({ email_address: email, status: 'subscribed' }),
  });

  const data = await response.json();

  if (response.ok || data.title === 'Member Exists') {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 400, body: JSON.stringify({ error: data.detail || 'Signup failed' }) };
};
