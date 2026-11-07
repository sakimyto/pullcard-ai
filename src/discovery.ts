// Search discovery is static and must not touch card generation, storage or quotas.
export function discoveryResponse(request: Request): Response | null {
  const pages: Record<string, { body: string; type: string }> = {
    '/robots.txt': {
      body: 'User-agent: Googlebot\nAllow: /\n\nUser-agent: bingbot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: https://pullcard.sakimyto.com/sitemap.xml\n',
      type: 'text/plain; charset=utf-8',
    },
    '/sitemap.xml': {
      body: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pullcard.sakimyto.com/</loc></url></urlset>\n',
      type: 'application/xml; charset=utf-8',
    },
  }
  const path = new URL(request.url).pathname
  if (!Object.hasOwn(pages, path)) return null
  if (request.method !== 'GET' && request.method !== 'HEAD')
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  const { body, type } = pages[path]
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
