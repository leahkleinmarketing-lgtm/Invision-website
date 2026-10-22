const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../functions/blog/[slug].js'), 'utf8');
const template = fs.readFileSync(path.join(__dirname, '../blog-post.html'), 'utf8');
const handler = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const request = new Request('https://example.com/blog/test-post');

test('article route renders published Sanity content and escapes HTML', async () => {
  const {onRequestGet} = await handler;
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({result: {
    title: 'Test <Post>', slug: 'test-post', excerpt: 'A short summary',
    publishedAt: '2026-10-01T12:00:00Z',
    body: [{_type: 'block', children: [{text: 'Hello <reader>', marks: []}]}],
  }}));
  try {
    const response = await onRequestGet({
      request, params: {slug: 'test-post'},
      env: {SANITY_PROJECT_ID: 'abc123', ASSETS: {fetch: async () => new Response(template)}},
    });
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /<title>Test &lt;Post&gt; \| In Vision Hair Design<\/title>/);
    assert.match(html, /Hello &lt;reader&gt;/);
    assert.match(html, /rel="canonical"/);
    assert.doesNotMatch(html, /id="blog-article" hidden/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('article route waits for Sanity project setup', async () => {
  const {onRequestGet} = await handler;
  const response = await onRequestGet({request, params: {slug: 'test-post'}, env: {}});
  assert.equal(response.status, 503);
});
