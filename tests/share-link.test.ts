import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { renderLandingPage } from '~/landing'
import { landingFacts } from './landing-design-contract'

function assertShareLink(html: string) {
  const anchor = html.match(/<a\b[^>]*id="share-x"[^>]*>[\s\S]*?<\/a>/)?.[0]
  assert(anchor, 'PC9 share destination is a link')
  const content = anchor.slice(anchor.indexOf('>') + 1, anchor.lastIndexOf('</a>'))
  assert.doesNotMatch(
    content,
    /<(?:button|input|select|textarea|a)\b/,
    'PC9 one interactive control',
  )
  assert.equal(content, 'Share on X', 'PC9 existing label')
}
describe('native result share action', () => {
  const html = renderLandingPage()
  it('uses one link with the existing label', () => assertShareLink(html))
  it('keeps unapproved share text and attributes visible to the frozen body oracle', () => {
    for (const changed of [
      html.replace('>Share on X</a>', '>Changed label</a>'),
      html.replace('class="button-link ghost"', 'class="button-link ghost" data-unapproved="true"'),
    ]) {
      expect(changed).not.toBe(html)
      expect(landingFacts(changed).body).not.toEqual(landingFacts(html).body)
    }
  })
  it('rejects a valid HTML regression nesting another interactive control', () => {
    const broken = html.replace('>Share on X</a>', '><button>Share on X</button></a>')
    expect(broken).not.toBe(html)
    expect(() => assertShareLink(broken)).toThrow(/PC9/)
  })
})
