const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {title, "slug": slug.current, excerpt, publishedAt, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

function card(post) {
  if (!post?.title || typeof post.slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/i.test(post.slug)) return '';
  const href = `https://www.invisionhairdesign.com/blog/${encodeURIComponent(post.slug)}`;
  const date = new Date(post.publishedAt);
  const dateText = Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'}).format(date);
  let image = '';
  if (typeof post.imageUrl === 'string' && post.imageUrl.startsWith('https://cdn.sanity.io/')) {
    const url = new URL(post.imageUrl);
    url.searchParams.set('w', '900');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    url.searchParams.set('q', '80');
    image = `<img src="${escapeHtml(url.href)}" alt="${escapeHtml(post.imageAlt)}" width="900" height="600" loading="lazy" decoding="async">`;
  }
  return `<article class="blog-card"><a href="${escapeHtml(href)}">${image}<div class="blog-card-body"><time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(dateText)}</time><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p><span class="blog-card-more">Read the story</span></div></a></article>`;
}

export async function onRequestGet({request, env}) {
  const template = await env.ASSETS.fetch(new Request(new URL('/blog.html', request.url)));
  if (!template.ok) return new Response('Blog unavailable', {status: 500});
  let html = await template.text();
  html = html.replace('<head>', '<head>\n  <base href="/">');
  const projectId = 'r18wndg7';
  const dataset = 'production';
  try {
    const url = new URL(`https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
    url.searchParams.set('query', query);
    url.searchParams.set('perspective', 'published');
    url.searchParams.set('returnQuery', 'false');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sanity request failed');
    const posts = (await response.json()).result;
    if (!Array.isArray(posts)) throw new Error('Invalid Sanity result');
    const seen = new Set();
    const cards = posts.filter(post => {
      if (!post?.slug || seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    }).map(card).join('');
    html = html.replace('<div id="blog-posts" class="blog-grid" aria-live="polite"></div>', `<div id="blog-posts" class="blog-grid" aria-live="polite">${cards}</div>`);
    if (cards) html = html.replace('<div id="blog-empty" class="blog-empty">', '<div id="blog-empty" class="blog-empty" hidden>');
    return new Response(html, {headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}});
  } catch {
    return new Response(html, {headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}});
  }
}
