document.addEventListener('click', (event) => {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link || typeof window.gtag !== 'function') return;

  const destination = new URL(link.href);
  if (destination.hostname !== 'www.joinblvd.com' ||
      !destination.pathname.startsWith('/b/invisionhairdesign/widget')) return;

  window.gtag('event', 'book_now_click', { transport_type: 'beacon' });
});
