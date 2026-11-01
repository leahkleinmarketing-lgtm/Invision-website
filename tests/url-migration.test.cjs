const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const origin = 'https://www.invisionhairdesign.com';
const pages = new Map([
  ['index.html', '/'],
  ['about.html', '/about'],
  ['services.html', '/services'],
  ['pricing.html', '/pricing'],
  ['team.html', '/team'],
  ['blog.html', '/blog'],
  ['contact.html', '/contact'],
  ['privacy-policy.html', '/privacy-policy'],
  ['terms-conditions.html', '/terms-conditions'],
]);

test('all indexed pages have the new canonical and Open Graph URL', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  for (const [file, route] of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const url = origin + route;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), file);
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), file);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), file);
    assert.ok(fs.existsSync(path.join(root, 'dist', file)), file);
    assert.equal(fs.readFileSync(path.join(root, 'dist', file), 'utf8'), html, file);
  }
  assert.ok(fs.readFileSync(path.join(root, 'dist', 'robots.txt'), 'utf8').includes(`${origin}/sitemap.xml`));
});

test('internal page links use canonical routes', () => {
  const validRoutes = new Set(pages.values());
  for (const file of [...pages.keys(), 'blog-post.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      const url = new URL(href, origin);
      if (url.hostname !== 'www.invisionhairdesign.com') continue;
      assert.ok(href.startsWith(origin), `${file}: ${href}`);
      assert.ok(validRoutes.has(url.pathname), `${file}: ${href}`);
    }
  }
});

test('legacy paths and apex domain redirect permanently', async () => {
  const source = fs.readFileSync(path.join(root, 'functions/_middleware.js'), 'utf8');
  const {onRequest} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const redirect = async (url) => onRequest({request: new Request(url), next: () => new Response('ok')});
  const pdf = await redirect(`${origin}/_files/ugd/4492ca_0157cde771824ebe89f33471177ab868.pdf`);
  assert.equal(pdf.status, 301);
  assert.equal(pdf.headers.get('location'), `${origin}/pricing`);
  const oldSitemap = await redirect(`${origin}/pages-sitemap.xml`);
  assert.equal(oldSitemap.status, 301);
  assert.equal(oldSitemap.headers.get('location'), `${origin}/sitemap.xml`);
  const apex = await redirect('https://invisionhairdesign.com/about?ref=old');
  assert.equal(apex.status, 301);
  assert.equal(apex.headers.get('location'), `${origin}/about?ref=old`);
  const current = await redirect(`${origin}/privacy-policy`);
  assert.equal(current.status, 200);
});
