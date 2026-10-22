window.sanityBlog = (() => {
  const config = window.sanityBlogConfig || {};
  const projectId = String(config.projectId || '').trim();
  const dataset = String(config.dataset || 'production').trim();
  const apiVersion = String(config.apiVersion || '2025-02-19').trim();
  const ready = /^[a-z0-9-]+$/.test(projectId) && /^[a-z0-9_-]+$/.test(dataset) && /^\d{4}-\d{2}-\d{2}$/.test(apiVersion);

  const listQuery = `*[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) [0...30] {title, "slug": slug.current, excerpt, publishedAt, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt}`;
  const postQuery = `*[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0] {title, "slug": slug.current, excerpt, publishedAt, seoDescription, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt, body[]{..., _type == "image" => {"imageUrl": asset->url, alt}}}`;

  async function query(groq, params = {}) {
    if (!ready) return null;
    const url = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`);
    url.searchParams.set('query', groq);
    url.searchParams.set('perspective', 'published');
    url.searchParams.set('returnQuery', 'false');
    for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sanity query failed');
    const data = await response.json();
    return data.result;
  }

  function imageUrl(source, width = 900) {
    if (typeof source !== 'string' || !source.startsWith('https://cdn.sanity.io/')) return '';
    const url = new URL(source);
    url.searchParams.set('w', String(width));
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    url.searchParams.set('q', '80');
    return url.href;
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'}).format(date);
  }

  return {
    ready,
    list: () => query(listQuery),
    post: (slug) => query(postQuery, { slug }),
    imageUrl,
    formatDate,
  };
})();
