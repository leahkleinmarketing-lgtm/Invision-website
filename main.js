const reviewRoot = document.querySelector('#review-cards');
for (const review of reviewRoot ? (window.clientReviews || []) : []) {
  const card = document.createElement('article');
  card.className = 'review-card';
  const stars = document.createElement('div');
  stars.className = 'review-stars';
  stars.setAttribute('aria-label', Number.isInteger(review.rating) ? `${review.rating} out of 5 stars` : 'Rating pending verification');
  stars.textContent = Number.isInteger(review.rating) ? '★'.repeat(review.rating) : '';
  const name = document.createElement('h3');
  name.textContent = review.name;
  const quote = document.createElement('blockquote');
  quote.textContent = `“${review.excerpt}”`;
  card.append(stars, name, quote);
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.setAttribute('title', 'Read the full review on Google');
  card.addEventListener('click', () => window.open(review.url, '_blank', 'noopener,noreferrer'));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter') window.open(review.url, '_blank', 'noopener,noreferrer');
  });
  reviewRoot.append(card);
}
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }
});

const servicesNav = nav.querySelector('.nav-services');
const servicesToggle = servicesNav?.querySelector('.nav-services-toggle');
if (servicesToggle) {
  const closeServicesMenu = () => {
    servicesToggle.setAttribute('aria-expanded', 'false');
    servicesNav.classList.remove('is-open');
  };
  servicesToggle.addEventListener('click', () => {
    const open = servicesToggle.getAttribute('aria-expanded') !== 'true';
    servicesToggle.setAttribute('aria-expanded', String(open));
    servicesNav.classList.toggle('is-open', open);
  });
  document.addEventListener('click', event => {
    if (!servicesNav.contains(event.target)) closeServicesMenu();
  });
}
