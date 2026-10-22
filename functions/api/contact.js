const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedServices = new Set([
  '', 'Root touch-up', 'Color', 'Highlights or balayage', "Women's haircut",
  "Men's haircut", 'Perm', 'Hair extensions', 'Blowout', 'Hair treatment', 'Something else',
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid origin.' }, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Expected a JSON form submission.' }, 415);
  }
  if (Number(request.headers.get('Content-Length') || 0) > 12000) return json({ error: 'Message is too long.' }, 413);

  let input;
  try {
    const body = await request.text();
    if (body.length > 12000) return json({ error: 'Message is too long.' }, 413);
    input = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid form submission.' }, 400);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ error: 'Invalid form submission.' }, 400);
  if (input.website) return json({ ok: true });

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const service = typeof input.service === 'string' ? input.service.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (name.length < 1 || name.length > 100 || /[\r\n]/.test(name) ||
      email.length > 254 || !emailPattern.test(email) || /[\r\n]/.test(email) ||
      phone.length > 30 || /[\r\n]/.test(phone) ||
      !allowedServices.has(service) || message.length < 1 || message.length > 3000) {
    return json({ error: 'Please check your details and try again.' }, 400);
  }

  const to = env.CONTACT_TO_EMAIL || 'infoinvisionhairdesign@gmail.com';
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !emailPattern.test(to)) {
    return json({ error: 'The contact form is not ready yet.' }, 503);
  }

  const text = [
    'New website contact message',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Service: ${service || 'Not selected'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [to],
        reply_to: email,
        subject: 'New website message | In Vision Hair Design',
        text,
      }),
    });
    if (!response.ok) {
      console.error('Resend rejected a contact message:', response.status);
      return json({ error: 'Message could not be sent right now.' }, 502);
    }
    return json({ ok: true });
  } catch {
    console.error('Resend request failed.');
    return json({ error: 'Message could not be sent right now.' }, 502);
  }
}
