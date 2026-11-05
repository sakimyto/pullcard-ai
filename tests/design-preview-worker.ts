// Development-only fixtures. This file is never imported by api/index.ts.
import worker from '../api/index'
import { normalizeGlow, normalizeTheme } from '../src/card/customization'
import { renderCardResult } from '../src/handler'
import { makeCardData } from './fixtures/cardData'
import { MODES, galleryFixture } from './fixtures/designData'

export default {
  async fetch(req: Request, _env: unknown, ctx: ExecutionContext) {
    const url = new URL(req.url)
    const referer = req.headers.get('referer')
    const mode =
      url.searchParams.get('fixture') ??
      (referer ? new URL(referer).searchParams.get('fixture') : null) ??
      'demo'
    if (url.pathname === '/api/gallery') return Response.json(galleryFixture(mode))
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 })
    const user = url.searchParams.get('user')
    if (user) {
      const fixture = galleryFixture(mode).find((entry) => entry.user === user)
      const data = makeCardData({ username: user })
      if (fixture?.power === 10200 || fixture?.power === 0 || fixture?.power === 17) {
        const score = fixture.power === 10200 ? 100 : 0
        Object.assign(data.stats, {
          velocity: fixture.power === 17 ? 1 : score,
          diversity: score,
          consistency: score,
          synergy: score,
          range: score,
          flow: score,
          power: fixture.power,
        })
      }
      const rendered = renderCardResult(
        { kind: 'ok', data },
        {
          theme: normalizeTheme(url.searchParams.get('theme')),
          glow: normalizeGlow(url.searchParams.get('glow')),
        },
      )
      return new Response(rendered.svg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
      })
    }
    // Root and local fonts use the real Worker; bindings and credentials are never passed in.
    const response = await worker.fetch(req, {} as never, ctx)
    if (url.pathname !== '/') return response
    const selector = `<form style="padding:24px;text-align:center;font:14px var(--font-sans);color:var(--muted)"><label>Development fixture <select name="fixture" style="min-height:44px;font:inherit" onchange="this.form.submit()">${MODES.map((value) => `<option value="${value}"${value === mode ? ' selected' : ''}>${value === 'demo' ? 'Demo data' : value === 'worst' ? 'Worst case' : value}</option>`).join('')}</select></label></form>`
    return new Response((await response.text()).replace('</body>', `${selector}</body>`), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  },
}
