const blogGrid = document.querySelector('#blog-posts');
const blogEmpty = document.querySelector('#blog-empty');
const blogError = document.querySelector('#blog-error');

if (blogGrid && window.sanityBlog?.ready) {
  window.sanityBlog.list().then((posts) => {
    if (!Array.isArray(posts) || posts.length === 0) return;
    blogEmpty.hidden = true;
    for (const post of posts) {
      if (!post?.title || !post?.slug) continue;
      const article = document.createElement('article');
      article.className = 'blog-card';
      const link = document.createElement('a');
      const localPreview = location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname);
      link.href = localPreview ? `blog-post.html?slug=${encodeURIComponent(post.slug)}` : `/blog/${encodeURIComponent(post.slug)}`;
      const imageUrl = window.sanityBlog.imageUrl(post.imageUrl, 900);
      if (imageUrl) {
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = post.imageAlt || '';
        image.width = 900;
        image.height = 600;
        image.loading = 'lazy';
        image.decoding = 'async';
        link.append(image);
      }
      const body = document.createElement('div');
      body.className = 'blog-card-body';
      const date = document.createElement('time');
      date.dateTime = post.publishedAt;
      date.textContent = window.sanityBlog.formatDate(post.publishedAt);
      const heading = document.createElement('h3');
      heading.textContent = post.title;
      const excerpt = document.createElement('p');
      excerpt.textContent = post.excerpt || '';
      const more = document.createElement('span');
      more.className = 'blog-card-more';
      more.textContent = 'Read the story';
      body.append(date, heading, excerpt, more);
      link.append(body);
      article.append(link);
      blogGrid.append(article);
    }
    if (!blogGrid.children.length) blogEmpty.hidden = false;
  }).catch(() => {
    blogEmpty.hidden = true;
    blogError.hidden = false;
  });
}
