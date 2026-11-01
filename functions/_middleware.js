const legacyPaths = new Map([
  ['/_files/ugd/4492ca_0157cde771824ebe89f33471177ab868.pdf', '/pricing'],
  ['/pages-sitemap.xml', '/sitemap.xml'],
]);

export function onRequest({request, next}) {
  const url = new URL(request.url);
  const replacement = legacyPaths.get(url.pathname);
  if (replacement) url.pathname = replacement;

  if (url.hostname === 'invisionhairdesign.com' || replacement) {
    url.protocol = 'https:';
    url.hostname = 'www.invisionhairdesign.com';
    return Response.redirect(url.href, 301);
  }

  return next();
}
