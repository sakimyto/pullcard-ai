import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderLandingPage } from '~/landing'
import { checkChromeScript, landingFacts } from './landing-design-contract'

const baseline = JSON.parse(readFileSync('tests/fixtures/landing-design-3c93b9f.json', 'utf8'))
function assertShell(html: string) {
  for (const selector of ['\\.app-header', '\\.app-menu nav'])
    assert.match(
      html,
      new RegExp(`${selector} \\{[^}]*background: var\\(--panel\\)`),
      'PC7 floating panel',
    )
  assert.doesNotMatch(html, /--band\s*:|var\(--band\)/, 'PC7 no duplicate chrome palette')
  assert.match(html, /summary:hover \{ background: var\(--accent-soft\)/, 'PC7 visible hover')
  assert.match(html, /gallery-title \{[^}]*margin-bottom: 8px/, 'PC8 related explanation')
  assert.match(html, /gallery-note \{[^}]*margin-bottom: 24px/, 'PC8 content group gap')
  assert.match(
    html,
    /\.app-name span \{[^}]*overflow: hidden; text-overflow: ellipsis/,
    'PC3 name remains within chrome',
  )
  assert.match(
    html,
    /input#username-input \{ width: 100%; max-width: 100%/,
    'PC3 input remains within its column',
  )
  assert.doesNotMatch(html, /text-wrap\s*:\s*balance/, 'PC3 normal heading wrap')
  assert.match(html, /class="app-home" href="https:\/\/sakimyto.com\/"/, 'PC1 shared home')
  assert.match(html, /class="app-name" href="\/"/, 'PC1 service home')
  assert.match(html, /href="https:\/\/sakimyto.com\/lab">All services<\/a>/, 'PC1 directory')
  assert.deepEqual(
    [...html.matchAll(/href="([^"]+)">All services<\/a>/g)].map((m) => m[1]),
    ['https://sakimyto.com/lab', 'https://sakimyto.com/lab'],
    'PC1 directory targets',
  )
  assert(
    html.indexOf('id="username-input"') < html.indexOf('class="customizer"'),
    'PC2 primary action before appearance',
  )
  assert.doesNotMatch(
    html,
    /Pause (?:previews|motion)|Play (?:previews|motion)|見本を止める/,
    'PC6 no preview stop',
  )
}
describe('shared site design', () => {
  const html = renderLandingPage()
  it('rejects restoring balanced headings', () => {
    expect(() => assertShell(html.replace('</style>', 'h1{text-wrap:balance}</style>'))).toThrow(
      /PC3/,
    )
  })
  it('keeps gallery hover position stable', () => {
    const check = (value: string) =>
      assert.doesNotMatch(value, /\.g-card:hover\s*\{[^}]*transform/, 'PC3 stable gallery hover')
    check(html)
    expect(() =>
      check(html.replace('</style>', '.g-card:hover { transform: translateY(-4px) }</style>')),
    ).toThrow(/PC3/)
  })
  it('keeps the generator content, script and SEO contract', () =>
    expect(landingFacts(html)).toEqual(baseline))
  it('separates home links, local navigation and service directory', () => assertShell(html))
  it('enumerates menu, focus and theme transitions from the emitted script', () => {
    const script = html.match(/<script data-site-chrome>([\s\S]*?)<\/script>/)?.[1]
    expect(script).toBeDefined()
    expect(checkChromeScript(script ?? '')).toBe(456)
    for (const [from, to] of [
      ['summary.focus()', 'void summary'],
      ["event.key === 'Escape'", "event.key === 'Enter'"],
      [
        'if (!header.contains(event.target)) menu.open = false',
        'if (!header.contains(event.target)) menu.open = true',
      ],
      ["classList.toggle('light')", "classList.toggle('wrong')"],
    ]) {
      expect(script?.includes(from)).toBe(true)
      expect(() => checkChromeScript((script ?? '').replace(from, to))).toThrow(/PC3|PC4/)
    }
  })
  it('rejects plausible broken links, content, app behavior and metadata', () => {
    for (const [from, to] of [
      ['class="app-home" href="https://sakimyto.com/"', 'class="app-home" href="/"'],
      ['class="app-name" href="/"', 'class="app-name" href="/wrong"'],
      [
        'href="https://sakimyto.com/lab">All services',
        'href="https://sakimyto.com/about">All services',
      ],
    ]) {
      expect(html.includes(from)).toBe(true)
      expect(() => assertShell(html.replace(from, to))).toThrow(/PC1/)
    }
    for (const [from, to] of [
      ['Summon my card', 'Broken label'],
      ['id="username-input"', 'id="wrong-input"'],
      ['{0,38}', '{0,99}'],
      ['<title>PullCard AI', '<title>Other app'],
    ]) {
      expect(html.includes(from)).toBe(true)
      expect(landingFacts(html.replace(from, to))).not.toEqual(baseline)
    }
  })
})

it('rejects valid floating-surface and grouping regressions', () => {
  const html = renderLandingPage()
  assertShell(html)
  for (const [from, to, code] of [
    [
      'background: var(--panel); box-shadow: var(--shadow-shell)',
      'background: var(--bg); box-shadow: var(--shadow-shell)',
      'PC7',
    ],
    [
      'background: var(--panel); box-shadow: var(--shadow-menu)',
      'background: var(--bg); box-shadow: var(--shadow-menu)',
      'PC7',
    ],
    [
      'summary:hover { background: var(--accent-soft)',
      'summary:hover { background: var(--panel)',
      'PC7',
    ],
    [
      '.gallery-title { font-size: 20px; letter-spacing: -0.01em; margin-bottom: 8px',
      '.gallery-title { font-size: 20px; letter-spacing: -0.01em; margin-bottom: 24px',
      'PC8',
    ],
    [
      '.gallery-note { color: var(--muted); font-size: 13px; margin-bottom: 24px',
      '.gallery-note { color: var(--muted); font-size: 13px; margin-bottom: 8px',
      'PC8',
    ],
  ]) {
    expect(html.includes(from)).toBe(true)
    expect(() => assertShell(html.replace(from, to))).toThrow(new RegExp(code))
  }
})

it('rejects a valid stale chrome theme color in the emitted script', () => {
  const script =
    renderLandingPage().match(/<script data-site-chrome>([\s\S]*?)<\/script>/)?.[1] ?? ''
  expect(script).toContain("'#171c30'")
  expect(() => checkChromeScript(script.replace("'#171c30'", "'#0c1020'"))).toThrow(/PC7/)
})
