const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../functions/api/contact.js'), 'utf8');
const handler = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const url = 'https://salon.example/api/contact';
const valid = { name: 'Alex Client', email: 'alex@example.com', phone: '', service: 'Color', message: 'I have a question about color.' };

function request(body) {
  return new Request(url, {
    method: 'POST',
    headers: { Origin: 'https://salon.example', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('sends a valid message to the confirmed inbox with reply-to', async () => {
  const { onRequestPost } = await handler;
  const originalFetch = global.fetch;
  let sent;
  global.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: 'test' }), { status: 200 });
  };
  try {
    const response = await onRequestPost({ request: request(valid), env: { RESEND_API_KEY: 'test-key', CONTACT_FROM_EMAIL: 'Salon <hello@verified.example>' } });
    assert.equal(response.status, 200);
    assert.deepEqual(sent.to, ['infoinvisionhairdesign@gmail.com']);
    assert.equal(sent.reply_to, valid.email);
    assert.match(sent.text, /question about color/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('rejects invalid fields before email is sent', async () => {
  const { onRequestPost } = await handler;
  const response = await onRequestPost({ request: request({ ...valid, email: 'invalid' }), env: {} });
  assert.equal(response.status, 400);
});

test('does not claim delivery before the Resend settings are present', async () => {
  const { onRequestPost } = await handler;
  const response = await onRequestPost({ request: request(valid), env: {} });
  assert.equal(response.status, 503);
});
