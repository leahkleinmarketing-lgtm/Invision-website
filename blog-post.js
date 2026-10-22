const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const article = document.querySelector('#blog-article');
const missing = document.querySelector('#blog-post-missing');

function markedText(child, definitions = []) {
  let node = document.createTextNode(child?.text || '');
  for (const mark of child?.marks || []) {
    let wrapper;
    if (mark === 'strong') wrapper = document.createElement('strong');
    else if (mark === 'em') wrapper = document.createElement('em');
    else if (mark === 'code') wrapper = document.createElement('code');
    else {
      const definition = definitions.find((item) => item._key === mark && item._type === 'link');
      if (definition && /^https?:\/\//i.test(definition.href || '')) {
        wrapper = document.createElement('a');
        wrapper.href = definition.href;
        wrapper.rel = 'noopener noreferrer';
      }
    }
    if (wrapper) {
      wrapper.append(node);
      node = wrapper;
    }
  }
  return node;
}

function renderBody(blocks, destination) {
  let list = null;
  for (const block of Array.isArray(blocks) ? blocks : []) {
    if (block?._type === 'image') {
      list = null;
      const source = window.sanityBlog.imageUrl(block.imageUrl, 1200);
      if (!source) continue;
      const image = document.createElement('img');
      image.src = source;
      image.alt = block.alt || '';
      image.loading = 'lazy';
      image.decoding = 'async';
      destination.append(image);
      continue;
    }
    if (block?._type !== 'block') continue;
    const style = block.style || 'normal';
    const listType = block.listItem === 'bullet' ? 'ul' : block.listItem === 'number' ? 'ol' : null;
    if (listType && (!list || list.tagName.toLowerCase() !== listType)) {
      list = document.createElement(listType);
      destination.append(list);
    } else if (!listType) list = null;
    const tag = listType ? 'li' : style === 'h2' ? 'h2' : style === 'h3' ? 'h3' : style === 'blockquote' ? 'blockquote' : 'p';
    const element = document.createElement(tag);
    for (const child of block.children || []) element.append(markedText(child, block.markDefs));
    (list || destination).append(element);
  }
}

if (slug && /^[a-z0-9][a-z0-9-]*$/i.test(slug) && window.sanityBlog?.ready) {
  window.sanityBlog.post(slug).then((post) => {
    if (!post?.title || !post?.slug) return;
    const title = document.querySelector('#post-title');
    const excerpt = document.querySelector('#post-excerpt');
    const date = document.querySelector('#post-date');
    const cover = document.querySelector('#post-cover');
    title.textContent = post.title;
    excerpt.textContent = post.excerpt || '';
    excerpt.hidden = !post.excerpt;
    date.dateTime = post.publishedAt;
    date.textContent = window.sanityBlog.formatDate(post.publishedAt);
    const coverUrl = window.sanityBlog.imageUrl(post.imageUrl, 1200);
    if (coverUrl) {
      cover.src = coverUrl;
      cover.alt = post.imageAlt || '';
      cover.hidden = false;
    }
    renderBody(post.body, document.querySelector('#post-body'));
    document.title = `${post.title} | In Vision Hair Design`;
    document.querySelector('meta[name="description"]').content = post.seoDescription || post.excerpt || 'Read the hair journal from In Vision Hair Design in St. Johns, Florida.';
    missing.hidden = true;
    article.hidden = false;
  }).catch(() => {
    missing.querySelector('p').textContent = 'This story could not load right now. Please try again later.';
  });
}
