import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LONG_LOGIN, galleryFixture } from './fixtures/designData'

describe('development UI fixture boundaries', () => {
  it('uses actual username, count and power boundaries', () => {
    expect(LONG_LOGIN.length).toBe(39)
    expect(galleryFixture('empty')).toHaveLength(0)
    expect(galleryFixture('one')).toHaveLength(1)
    expect(galleryFixture('worst')).toHaveLength(24)
    for (const mode of ['demo', 'worst', 'one'])
      for (const entry of galleryFixture(mode)) {
        expect(entry.user).toMatch(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/)
        if (entry.power !== undefined) expect(entry.power).toBeLessThanOrEqual(10200)
      }
  })
  it('keeps fixture UI and data outside the production entry', () => {
    expect(readFileSync('tests/design-preview-worker.ts', 'utf8')).not.toMatch(
      /^export (?!default)/m,
    )
    expect(readFileSync('wrangler.toml', 'utf8')).toContain('main = "api/index.ts"')
    for (const file of ['api/index.ts', 'src/landing.ts', 'src/site-design.ts'])
      expect(readFileSync(file, 'utf8')).not.toMatch(
        /design-preview|galleryFixture|Development fixture/,
      )
  })
})
