// Requires a separately provisioned Playwright 1.64.1; no production dependency.
// Run against the dev-only fixture Worker, never a real GitHub-backed endpoint.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const browserModule = process.env.PLAYWRIGHT_MODULE || 'playwright'
const { chromium, webkit } = require(browserModule)
assert.equal(require(`${browserModule}/package.json`).version, '1.64.1')
const origin = new URL(process.argv[2] || 'http://127.0.0.1:8798')
assert(
  ['127.0.0.1', 'localhost'].includes(origin.hostname),
  'Only a local fixture Worker is allowed',
)
const engine = process.argv[3] || 'chromium'
assert(['chromium', 'webkit'].includes(engine))
const out = process.env.DESIGN_EVIDENCE || '/private/tmp/pullcard-hierarchy-ui'
mkdirSync(out, { recursive: true })
const browser = await { chromium, webkit }[engine].launch()
const records = []

function appearance() {
  const header = document.querySelector('.app-header')
  const menu = document.querySelector('.app-menu nav')
  const probe = document.createElement('i')
  probe.style.background = 'var(--panel)'
  document.body.append(probe)
  const panel = getComputedStyle(probe).backgroundColor
  probe.remove()
  const title = document.querySelector('.gallery-title')
  const note = document.querySelector('.gallery-note')
  const grid = document.querySelector('.gallery-grid')
  const name = document.querySelector('.app-name')
  const label = name.querySelector('span') || name
  const range = document.createRange()
  range.selectNodeContents(label)
  const labelBox = label.getBoundingClientRect()
  const textBox = range.getBoundingClientRect()
  const labelStyle = getComputedStyle(label)
  return {
    header: getComputedStyle(header).backgroundColor,
    menu: getComputedStyle(menu).backgroundColor,
    panel,
    body: getComputedStyle(document.body).backgroundColor,
    meta: document.querySelector('meta[name="theme-color"]').content,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    headingGap: note.getBoundingClientRect().top - title.getBoundingClientRect().bottom,
    contentGap: grid.getBoundingClientRect().top - note.getBoundingClientRect().bottom,
    gallery: !document.querySelector('#gallery').hidden,
    labelOverflow:
      textBox.right > labelBox.right + 1 &&
      !(labelStyle.overflowX === 'hidden' && labelStyle.textOverflow === 'ellipsis'),
    label: name.textContent,
  }
}
function check(value, theme) {
  assert.equal(value.header, value.panel, 'PC7 floating header')
  assert.equal(value.menu, value.panel, 'PC7 floating menu')
  assert.notEqual(value.panel, value.body, 'PC7 content differs from page')
  assert.equal(value.meta, theme === 'light' ? '#ffffff' : '#171c30', 'PC7 theme color')
  assert(!value.overflow, 'PC3 no horizontal overflow')
  assert(!value.labelOverflow, 'PC3 header name does not overlap controls')
  assert.equal(value.label, 'PullCard AI', 'PC1 full accessible service name')
  if (value.gallery) {
    assert.equal(value.headingGap, 8, 'PC8 related explanation')
    assert.equal(value.contentGap, 24, 'PC8 group separation')
  }
}
try {
  for (const width of [320, 390, 768, 1280]) {
    for (const theme of ['dark', 'light']) {
      for (const fixture of ['demo', 'worst', 'empty', 'one']) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          locale: 'en-US',
          reducedMotion: 'reduce',
        })
        try {
          await context.addInitScript((theme) => localStorage.setItem('theme', theme), theme)
          const page = await context.newPage()
          const errors = []
          page.on('pageerror', (error) => errors.push(error.message))
          await page.route('**/*', (route) => {
            if (new URL(route.request().url()).origin === origin.origin) return route.continue()
            errors.push(`Unexpected external request: ${new URL(route.request().url()).origin}`)
            return route.abort()
          })
          const response = await page.goto(`${origin.origin}/?fixture=${fixture}`, {
            waitUntil: 'networkidle',
          })
          assert.equal(response.status(), 200)
          assert(
            (await page.getByText('Development fixture', { exact: false }).count()) > 0,
            'Fixture boundary',
          )
          await page.evaluate(() => document.fonts.ready)
          assert.equal(
            await page.locator('.g-card').count(),
            fixture === 'worst' ? 24 : fixture === 'one' ? 1 : fixture === 'empty' ? 0 : 1,
          )
          const normal = await page.evaluate(appearance)
          check(normal, theme)
          if (fixture === 'demo') {
            await page.locator('#username-input').fill('octocat')
            await page.locator('#generate-button').click()
            const share = page.locator('#share-x')
            await share.waitFor({ state: 'visible' })
            const observeShare = (n) => ({
              tag: n.tagName,
              label: n.textContent,
              target: n.target,
              rel: n.rel,
              href: n.href,
              height: n.getBoundingClientRect().height,
              nested: n.querySelectorAll('button,input,select,textarea,a').length,
            })
            const checkShare = (action) => {
              assert.equal(action.tag, 'A')
              assert.equal(action.label, 'Share on X')
              assert.equal(action.target, '_blank')
              assert.equal(action.rel, 'noopener')
              assert.equal(action.nested, 0, 'PC9 one interactive control')
              assert(action.height >= 48)
              const destination = new URL(action.href)
              assert.equal(destination.origin, 'https://twitter.com')
              assert.equal(destination.pathname, '/intent/tweet')
              assert(destination.searchParams.get('text').includes('#octocat'))
            }
            const action = await share.evaluate(observeShare)
            checkShare(action)
            await share.focus()
            await page.keyboard.press('Tab')
            assert(
              !(await share.evaluate((n) => n.contains(document.activeElement))),
              'PC9 share has no second tab stop',
            )
            await share.evaluate((n) => {
              n.innerHTML = '<button>Share on X</button>'
            })
            const brokenAction = await share.evaluate(observeShare)
            assert.throws(() => checkShare(brokenAction), /PC9/)
            await share.evaluate((n) => {
              n.textContent = 'Share on X'
            })
            assert.equal(await share.locator('button').count(), 0)
          }

          if (width < 1024) {
            await page.locator('#app-menu > summary').click()
            assert(await page.locator('#app-menu').evaluate((node) => node.open))
            await page.keyboard.press('Escape')
            assert(
              await page
                .locator('#app-menu > summary')
                .evaluate((node) => node === document.activeElement),
            )
          }
          if (fixture === 'worst') {
            await page.evaluate(() => {
              const nodes = [...document.querySelectorAll('body *')].filter(
                (node) =>
                  node instanceof HTMLElement &&
                  ([...node.childNodes].some(
                    (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim(),
                  ) ||
                    /^(INPUT|SELECT|TEXTAREA)$/.test(node.tagName)),
              )
              const fonts = nodes.map((node) => [
                node,
                Number.parseFloat(getComputedStyle(node).fontSize),
              ])
              for (const [node, size] of fonts) node.style.fontSize = `${size * 2}px`
            })
            const enlarged = await page.evaluate(appearance)
            if (enlarged.overflow || enlarged.labelOverflow) {
              const outside = await page.evaluate(() =>
                [...document.querySelectorAll('body *')]
                  .map((node) => ({
                    tag: node.tagName,
                    cls: node.getAttribute('class'),
                    text: node.textContent.slice(0, 60),
                    left: node.getBoundingClientRect().left,
                    right: node.getBoundingClientRect().right,
                  }))
                  .filter((node) => node.right > innerWidth + 1 || node.left < -1)
                  .slice(0, 12),
              )
              writeFileSync(
                `${out}/counterexample.json`,
                JSON.stringify({ width, theme, fixture, enlarged, outside }, null, 2),
              )
              await page.screenshot({ path: `${out}/counterexample.png` })
            }
            check(enlarged, theme)
          }
          if (width === 390 && fixture === 'demo')
            await page.screenshot({ path: `${out}/${engine}-${theme}.png` })
          assert.deepEqual(errors, [])
          records.push({ width, theme, fixture, ...normal })
        } finally {
          await context.close()
        }
      }
    }
  }
  writeFileSync(`${out}/${engine}.json`, `${JSON.stringify(records, null, 2)}\n`)
  console.log(
    `${engine}: ${records.length} fixture views; themes, name, grouping and 200% HTML text passed`,
  )
} finally {
  await browser.close()
}
