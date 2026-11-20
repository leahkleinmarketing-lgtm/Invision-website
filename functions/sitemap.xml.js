const query = `*[_type == "post" && defined(slug.current)] {"slug": slug.current, _updatedAt}`;
const validSlug = slug => typeof slug === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(slug);
const escapeXml = value => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[character]));

export async function onRequestGet({request, env}) {
  const projectId = 'r18wndg7';
  const dataset = 'production';

  try {
    const [baseResponse, postsResponse] = await Promise.all([
      env.ASSETS.fetch(new Request(new URL('/sitemap.xml', request.url))),
      (async () => {
        const url = new URL(`https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
        url.searchParams.set('query', query);
        url.searchParams.set('perspective', 'published');
        url.searchParams.set('returnQuery', 'false');
        return fetch(url);
      })(),
    ]);
    if (!baseResponse.ok || !postsResponse.ok) throw new Error('Sitemap source unavailable');
    const base = await baseResponse.text();
    if (!base.includes('</urlset>')) throw new Error('Invalid base sitemap');
    const posts = (await postsResponse.json()).result;
    if (!Array.isArray(posts)) throw new Error('Invalid Sanity result');
    const seen = new Set();
    const entries = posts.filter(post => {
      if (!validSlug(post?.slug) || seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    }).map(post => {
      const loc = `https://www.invisionhairdesign.com/blog/${encodeURIComponent(post.slug)}`;
      const date = new Date(post._updatedAt);
      const lastmod = Number.isNaN(date.getTime()) ? '' : `<lastmod>${date.toISOString()}</lastmod>`;
      return `  <url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`;
    }).join('\n');
    const xml = base.replace('</urlset>', `${entries ? `${entries}\n` : ''}</urlset>`);
    return new Response(xml, {headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store'}});
  } catch {
    return new Response('Sitemap temporarily unavailable', {status: 503, headers: {'Cache-Control': 'no-store'}});
  }
}
