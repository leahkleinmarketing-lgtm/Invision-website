const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...30] {title, "slug": slug.current, excerpt, publishedAt, "imageUrl": coverImage.asset->url, "imageAlt": coverImage.alt}`;

export async function onRequestGet() {
  const projectId = 'r18wndg7';
  const dataset = 'production';
  const url = new URL(`https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
  url.searchParams.set('query', query);
  url.searchParams.set('perspective', 'published');
  url.searchParams.set('returnQuery', 'false');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Sanity request failed');
    const posts = (await response.json()).result;
    return Response.json(Array.isArray(posts) ? posts : [], {headers: {'Cache-Control': 'no-store'}});
  } catch {
    return Response.json({error: 'Stories temporarily unavailable'}, {status: 502, headers: {'Cache-Control': 'no-store'}});
  }
}
