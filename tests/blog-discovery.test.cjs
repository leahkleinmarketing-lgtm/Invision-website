const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const load = name => import(`data:text/javascript;base64,${Buffer.from(fs.readFileSync(path.join(root, 'functions', name))).toString('base64')}`);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const blog = fs.readFileSync(path.join(root, 'blog.html'), 'utf8');
const posts = [
  {title: 'Magic Sleek & More', slug: 'magic-sleek', excerpt: 'A <summary>', publishedAt: '2026-11-02T15:00:00Z', _updatedAt: '2026-11-03T15:00:00Z'},
  {title: 'Second story', slug: 'second-story', excerpt: 'Another summary', publishedAt: '2026-11-01T15:00:00Z'},
  {title: 'Duplicate', slug: 'magic-sleek', publishedAt: '2026-11-02T15:00:00Z'},
  {title: 'Invalid', slug: 'bad/slug', publishedAt: '2026-11-02T15:00:00Z'},
];

test('sitemap retains fixed pages and lists each published slug once', async () => {
  const {onRequestGet} = await load('sitemap.xml.js');
  const originalFetch = global.fetch;
  let sanityUrl;
  global.fetch = async url => {
    sanityUrl = new URL(url);
    return new Response(JSON.stringify({result: posts}));
  };
  try {
    const response = await onRequestGet({request: new Request('https://www.invisionhairdesign.com/sitemap.xml'), env: {
      ASSETS: {fetch: async () => new Response(sitemap)},
    }});
    const xml = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /application\/xml/);
    assert.match(sanityUrl.searchParams.get('query'), /defined\(slug.current\)/);
    assert.equal(sanityUrl.searchParams.get('perspective'), 'published');
    assert.match(xml, /https:\/\/www\.invisionhairdesign\.com\/contact/);
    assert.equal((xml.match(/https:\/\/www\.invisionhairdesign\.com\/blog\/magic-sleek/g) || []).length, 1);
    assert.match(xml, /https:\/\/www\.invisionhairdesign\.com\/blog\/second-story/);
    assert.match(xml, /<lastmod>2026-11-03T15:00:00.000Z<\/lastmod>/);
    assert.doesNotMatch(xml, /bad\/slug/);
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<\/urlset>\s*$/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('blog index includes crawlable article links in response HTML', async () => {
  const {onRequestGet} = await load('blog.js');
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({result: posts}));
  try {
    const response = await onRequestGet({request: new Request('https://www.invisionhairdesign.com/blog'), env: {
      ASSETS: {fetch: async () => new Response(blog)},
    }});
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /<a href="https:\/\/www\.invisionhairdesign\.com\/blog\/magic-sleek">/);
    assert.equal((html.match(/href="https:\/\/www\.invisionhairdesign\.com\/blog\/magic-sleek"/g) || []).length, 1);
    assert.match(html, /Magic Sleek &amp; More/);
    assert.match(html, /A &lt;summary&gt;/);
    assert.match(html, /id="blog-empty" class="blog-empty" hidden/);
  } finally {
    global.fetch = originalFetch;
  }
});
