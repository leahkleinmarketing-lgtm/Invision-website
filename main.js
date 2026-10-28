const reviewRoot = document.querySelector('#review-cards');
for (const review of reviewRoot ? (window.clientReviews || []) : []) {
  const card = document.createElement('article');
  card.className = 'review-card';
  const stars = document.createElement('div');
  stars.className = 'review-stars';
  stars.setAttribute('aria-label', 'Five stars shown in approved design');
  stars.textContent = '★★★★★';
  const name = document.createElement('h3');
  name.textContent = review.name;
  const quote = document.createElement('blockquote');
  quote.textContent = `“${review.quote}”`;
  card.append(stars, name, quote);
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
