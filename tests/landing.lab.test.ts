import { describe, expect, it } from 'vitest'
import { renderLandingPage } from '~/landing'

const LAB_URL = 'https://sakimyto.com/lab/pullcard'

function jsonLd(html: string) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  if (!m) throw new Error('no JSON-LD block')
  return JSON.parse(m[1])
}

describe('sakimyto.com lab linkage', () => {
  const html = renderLandingPage()

  it('declares the app with sakimyto as creator and the lab record as related page', () => {
    const ld = jsonLd(html)
    expect(ld['@type']).toBe('WebApplication')
    expect(ld.url).toBe('https://pullcard.sakimyto.com/')
    expect(ld.creator).toEqual({ '@id': 'https://sakimyto.com/#person' })
    expect(ld.sameAs).toContain(LAB_URL)
  })

  it('keeps its own canonical URL', () => {
    expect(html).toContain('<link rel="canonical" href="https://pullcard.sakimyto.com/" />')
  })

  it('links back to the lab record in the footer', () => {
    const footer = html.slice(html.indexOf('<footer>'), html.indexOf('</footer>'))
    expect(footer).toContain(`href="${LAB_URL}"`)
  })
})
