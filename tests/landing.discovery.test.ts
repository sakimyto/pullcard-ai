import { describe, expect, it } from 'vitest'
import { renderLandingPage } from '~/landing'

describe('PD1–PD3 first use and discovery', () => {
  const html = renderLandingPage()
  it('keeps appearance controls in an initially closed native disclosure', () => {
    expect(html).toContain('<details data-appearance>')
    expect(html).not.toContain('<details data-appearance open')
    expect(html.indexOf('<details data-appearance>')).toBeLessThan(
      html.indexOf('name="card-theme"'),
    )
  })
  it('exposes the main content and live username guidance', () => {
    expect(html).toContain('<main id="main">')
    expect(html).toContain('aria-describedby="username-help input-hint"')
    expect(html).toContain('id="input-hint" role="status" aria-live="polite"')
    expect(html).toContain('id="username-help"')
  })
  it('shares the same real example card with Open Graph and Twitter', () => {
    expect(html).toContain(
      'property="og:image" content="https://pullcard.sakimyto.com/og?user=sakimyto&amp;theme=dark&amp;glow=soft"',
    )
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).toContain('id="how-it-works"')
  })
})

import assert from 'node:assert/strict'
function checkDiscovery(html: string) {
  assert.match(html, /<main id="main">/, 'PD2 main landmark')
  assert.match(html, /<details data-appearance>/, 'PD1 initially closed appearance')
  assert.match(html, /id="input-hint" role="status" aria-live="polite"/, 'PD2 status feedback')
  assert.match(
    html,
    /og:image" content="https:\/\/pullcard\.sakimyto\.com\/og\?user=sakimyto&amp;theme=dark&amp;glow=soft"/,
    'PD3 matching visible example',
  )
}
it('PD1–3 checks the emitted markup and rejects four valid broken templates', () => {
  const html = renderLandingPage()
  checkDiscovery(html)
  for (const [from, to] of [
    ['<main id="main">', '<main id="lost">'],
    ['<details data-appearance>', '<details data-appearance open>'],
    ['role="status" aria-live="polite"', 'role="status" aria-live="off"'],
    ['og?user=sakimyto&amp;theme=dark', 'og?user=other&amp;theme=dark'],
  ]) {
    assert(html.includes(from))
    expect(() => checkDiscovery(html.replace(from, to))).toThrow(assert.AssertionError)
  }
})
