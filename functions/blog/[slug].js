const query = `*[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] {title, "slug": slug.current, excerpt, publishedAt, seoDescription, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt, body[]{..., _type == "image" => {"imageUrl": asset->url, alt}}}`;

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

function imageUrl(source, width = 1200) {
  if (typeof source !== 'string' || !source.startsWith('https://cdn.sanity.io/')) return '';
  const url = new URL(source);
  url.searchParams.set('w', String(width));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');
  url.searchParams.set('q', '80');
  return url.href;
}

function inlineText(child, definitions) {
  let text = escapeHtml(child?.text);
  for (const mark of child?.marks || []) {
    if (mark === 'strong') text = `<strong>${text}</strong>`;
    else if (mark === 'em') text = `<em>${text}</em>`;
    else if (mark === 'code') text = `<code>${text}</code>`;
    else {
      const definition = (definitions || []).find(item => item._key === mark && item._type === 'link');
      if (definition && /^https?:\/\//i.test(definition.href || '')) {
        text = `<a href="${escapeHtml(definition.href)}" rel="noopener noreferrer">${text}</a>`;
      }
    }
  }
  return text;
}

function renderBody(blocks) {
  const parts = [];
  let list = '';
  for (const block of Array.isArray(blocks) ? blocks : []) {
    if (block?._type === 'image') {
      if (list) { parts.push(`</${list}>`); list = ''; }
      const src = imageUrl(block.imageUrl);
      if (src) parts.push(`<img src="${escapeHtml(src)}" alt="${escapeHtml(block.alt)}" loading="lazy" decoding="async">`);
      continue;
    }
    if (block?._type !== 'block') continue;
    const nextList = block.listItem === 'bullet' ? 'ul' : block.listItem === 'number' ? 'ol' : '';
    if (list !== nextList) {
      if (list) parts.push(`</${list}>`);
      if (nextList) parts.push(`<${nextList}>`);
      list = nextList;
    }
    const style = block.style || 'normal';
    const tag = list ? 'li' : ['h2', 'h3', 'blockquote'].includes(style) ? style : 'p';
    const text = (block.children || []).map(child => inlineText(child, block.markDefs)).join('');
    parts.push(`<${tag}>${text}</${tag}>`);
  }
  if (list) parts.push(`</${list}>`);
  return parts.join('');
}

export async function onRequestGet({ request, env, params }) {
  const slug = params.slug;
  if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return new Response('Not found', {status: 404});
  const projectId = String(env.SANITY_PROJECT_ID || '');
  const dataset = String(env.SANITY_DATASET || 'production');
  if (!/^[a-z0-9-]+$/.test(projectId) || !/^[a-z0-9_-]+$/.test(dataset)) return new Response('Blog is not connected yet', {status: 503});

  const url = new URL(`https://${projectId}.apicdn.sanity.io/v2025-02-19/data/query/${dataset}`);
  url.searchParams.set('query', query);
  url.searchParams.set('$slug', JSON.stringify(slug));
  url.searchParams.set('perspective', 'published');
  url.searchParams.set('returnQuery', 'false');
  let post;
  try {
    const result = await fetch(url);
    if (!result.ok) throw new Error('Sanity request failed');
    post = (await result.json()).result;
  } catch {
    return new Response('Story temporarily unavailable', {status: 502});
  }
  if (!post?.title || !post?.slug) return new Response('Not found', {status: 404});

  const templateRequest = new Request(new URL('/blog-post.html', request.url));
  const templateResponse = await env.ASSETS.fetch(templateRequest);
  if (!templateResponse.ok) return new Response('Story template unavailable', {status: 500});
  let html = await templateResponse.text();
  const date = new Date(post.publishedAt);
  const formattedDate = Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'}).format(date);
  const description = post.seoDescription || post.excerpt || 'Read the hair journal from In Vision Hair Design in St. Johns, Florida.';
  const cover = imageUrl(post.imageUrl);
  html = html.replace('<title>Hair Journal | In Vision Hair Design</title>', `<title>${escapeHtml(post.title)} | In Vision Hair Design</title>`);
  html = html.replace('content="Read the hair journal from In Vision Hair Design in St. Johns, Florida."', `content="${escapeHtml(description)}"`);
  html = html.replace('<head>', `<head>\n  <base href="/">\n  <link rel="canonical" href="${escapeHtml(new URL(`/blog/${encodeURIComponent(slug)}`, request.url).href)}">`);
  html = html.replace('id="blog-article" hidden', 'id="blog-article"');
  html = html.replace('<time id="post-date" class="blog-post-date"></time>', `<time id="post-date" class="blog-post-date" datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(formattedDate)}</time>`);
  html = html.replace('<h1 id="post-title"></h1>', `<h1 id="post-title">${escapeHtml(post.title)}</h1>`);
  html = html.replace('<p id="post-excerpt"></p>', post.excerpt ? `<p id="post-excerpt">${escapeHtml(post.excerpt)}</p>` : '');
  html = html.replace('<img id="post-cover" class="blog-post-cover" alt="" width="1200" height="800" hidden>', cover ? `<img id="post-cover" class="blog-post-cover" src="${escapeHtml(cover)}" alt="${escapeHtml(post.imageAlt)}" width="1200" height="800">` : '');
  html = html.replace('<div id="post-body" class="blog-post-body"></div>', `<div id="post-body" class="blog-post-body">${renderBody(post.body)}</div>`);
  html = html.replace('id="blog-post-missing" aria-labelledby', 'id="blog-post-missing" hidden aria-labelledby');
  return new Response(html, {headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300'}});
}
