(function () {
  const form = document.getElementById('email-signup-form');
  if (!form) return;
  const input = document.getElementById('email-signup-input');
  const msg   = document.getElementById('email-signup-msg');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    msg.textContent = '';
    const email = input.value.trim();
    if (!email) return;

    const btn = form.querySelector('.email-signup-btn');
    btn.disabled = true;
    btn.textContent = 'Subscribing…';

    try {
      const res  = await fetch('/.netlify/functions/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        msg.textContent = 'You\'re on the list! Thanks for signing up.';
        input.value = '';
        btn.textContent = 'Subscribed ✓';
      } else {
        msg.textContent = data.error || 'Something went wrong. Please try again.';
        btn.disabled = false;
        btn.textContent = 'Subscribe';
      }
    } catch {
      msg.textContent = 'Something went wrong. Please try again.';
      btn.disabled = false;
      btn.textContent = 'Subscribe';
    }
  });
})();
