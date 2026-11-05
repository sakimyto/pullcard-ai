import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'

const digest = (value: string) => createHash('sha256').update(value).digest('hex')
export function landingFacts(html: string) {
  const body = html.slice(html.indexOf('<div class="wrap">'), html.lastIndexOf('\n  <script>'))
  const start = body.indexOf('<div class="row">')
  const end = body.indexOf('</p>', body.indexOf('<p class="hint"', start)) + 4
  assert(start >= 0 && end > start, 'PC2 primary block')
  const compact = (s: string) => s.replace(/>\s+</g, '><').trim()
  const primary = body
    .slice(start, end)
    .replace(/<input\b[^>]*id="username-input"[^>]*>/, (tag) =>
      tag
        .replace(' autocapitalize="none"', '')
        .replace(' autocorrect="off"', '')
        .replace(' enterkeyhint="go"', ''),
    )
  const rest = body.slice(0, start) + body.slice(end)
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  assert(scripts.length, 'PC2 app script')
  return {
    body: digest(`${compact(rest)}\n${compact(primary)}`),
    app: digest(scripts.at(-1)?.[1] ?? ''),
    seo: [
      ...html.matchAll(
        /<title>[^<]*<\/title>|<meta\b(?=[^>]*(?:name="description"|property="og:))[^>]*>|<link rel="canonical"[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
      ),
    ].map((m) => m[0]),
  }
}

const actions = ['open', 'escape', 'other', 'outside', 'inside', 'link', 'theme'] as const
const sequences = [
  [],
  ...actions.map((a) => [a]),
  ...actions.flatMap((a) => actions.map((b) => [a, b])),
]
export function checkChromeScript(script: string) {
  let checked = 0
  for (const initialLight of [false, true])
    for (const initialOpen of [false, true])
      for (const storage of [false, true])
        for (const sequence of sequences) {
          const classes = new Set(initialLight ? ['light'] : [])
          const docEvents: Record<string, (event: unknown) => void> = {}
          const headerEvents: Record<string, (event: unknown) => void> = {}
          const themeEvents: Record<string, () => void> = {}
          let focused = false
          const menu = { open: initialOpen }
          const summary = {
            focus: () => {
              focused = true
            },
          }
          const theme = {
            setAttribute: () => {},
            addEventListener: (k: string, f: () => void) => {
              themeEvents[k] = f
            },
          }
          const header = {
            contains: (target: unknown) => target === 'inside',
            addEventListener: (k: string, f: (e: unknown) => void) => {
              headerEvents[k] = f
            },
          }
          const document = {
            readyState: 'complete',
            documentElement: {
              classList: {
                contains: (name: string) => classes.has(name),
                toggle: (name: string) => {
                  if (classes.has(name)) {
                    classes.delete(name)
                    return false
                  }
                  classes.add(name)
                  return true
                },
              },
            },
            getElementById: (id: string) =>
              ({ 'app-header': header, 'app-menu': menu, 'site-theme-toggle': theme })[id],
            querySelector: (selector: string) =>
              selector === '#app-menu > summary' ? summary : { setAttribute: () => {} },
            addEventListener: (k: string, f: (e: unknown) => void) => {
              docEvents[k] = f
            },
          }
          runInNewContext(script, {
            document,
            localStorage: {
              setItem: () => {
                if (!storage) throw new Error('blocked storage')
              },
            },
          })
          let open = initialOpen
          let light = initialLight
          let focus = false
          for (const action of sequence) {
            if (action === 'open') {
              menu.open = !menu.open
              open = !open
            }
            if (action === 'escape') {
              docEvents.keydown({ key: 'Escape' })
              if (open) focus = true
              open = false
            }
            if (action === 'other') docEvents.keydown({ key: 'Enter' })
            if (action === 'outside') {
              docEvents.pointerdown({ target: 'outside' })
              open = false
            }
            if (action === 'inside') docEvents.pointerdown({ target: 'inside' })
            if (action === 'link') {
              headerEvents.click({ target: { closest: () => ({}) } })
              open = false
            }
            if (action === 'theme') {
              themeEvents.click()
              light = !light
            }
            assert.equal(menu.open, open, `PC4 menu ${sequence}`)
            assert.equal(focused, focus, `PC4 focus ${sequence}`)
            assert.equal(classes.has('light'), light, `PC3 theme ${sequence}`)
          }
          checked++
        }
  return checked
}
