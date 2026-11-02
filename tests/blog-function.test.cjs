const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../functions/blog/[slug].js'), 'utf8');
const template = fs.readFileSync(path.join(__dirname, '../blog-post.html'), 'utf8');
const handler = import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const listSource = fs.readFileSync(path.join(__dirname, '../functions/api/blog.js'), 'utf8');
const listHandler = import(`data:text/javascript;base64,${Buffer.from(listSource).toString('base64')}`);
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
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.match(html, /<title>Test &lt;Post&gt; \| In Vision Hair Design<\/title>/);
    assert.match(html, /Hello &lt;reader&gt;/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.invisionhairdesign\.com\/blog\/test-post"/);
    assert.match(html, /property="og:url" content="https:\/\/www\.invisionhairdesign\.com\/blog\/test-post"/);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.doesNotMatch(html, /id="blog-article" hidden/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('article route uses the public project when Cloudflare settings are absent', async () => {
  const {onRequestGet} = await handler;
  const originalFetch = global.fetch;
  let requestedUrl;
  global.fetch = async (url) => {
    requestedUrl = new URL(url);
    return new Response(JSON.stringify({result: {title: 'New story', slug: 'test-post', publishedAt: '2027-01-01T00:00:00Z'}}));
  };
  try {
    const response = await onRequestGet({
      request, params: {slug: 'test-post'},
      env: {ASSETS: {fetch: async () => new Response(template)}},
    });
    assert.equal(response.status, 200);
    assert.equal(requestedUrl.hostname, 'r18wndg7.api.sanity.io');
    assert.equal(requestedUrl.searchParams.get('perspective'), 'published');
    assert.doesNotMatch(requestedUrl.searchParams.get('query'), /publishedAt <= now\(\)/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('blog list route returns fresh published posts without browser CORS', async () => {
  const {onRequestGet} = await listHandler;
  const originalFetch = global.fetch;
  let requestedUrl;
  global.fetch = async (url) => {
    requestedUrl = new URL(url);
    return new Response(JSON.stringify({result: [{title: 'A story', slug: 'a-story', publishedAt: '2026-11-02T15:00:00Z'}]}));
  };
  try {
    const response = await onRequestGet({env: {}});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(requestedUrl.hostname, 'r18wndg7.api.sanity.io');
    assert.equal(requestedUrl.searchParams.get('perspective'), 'published');
    assert.deepEqual(await response.json(), [{title: 'A story', slug: 'a-story', publishedAt: '2026-11-02T15:00:00Z'}]);
  } finally {
    global.fetch = originalFetch;
  }
});
