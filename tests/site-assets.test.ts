import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import worker from '../api/index'

beforeEach(() => vi.stubGlobal('caches', { default: { match: vi.fn(), put: vi.fn() } }))
afterEach(() => vi.unstubAllGlobals())
describe('site font routes', () => {
  for (const font of ['Geist', 'GeistMono'])
    for (const method of ['GET', 'HEAD', 'POST']) {
      it(`${method} ${font} avoids application storage and upstream`, async () => {
        const env = new Proxy(
          {},
          {
            get() {
              throw new Error('PC5 touched environment')
            },
          },
        )
        const response = await worker.fetch(
          new Request(`https://pullcard.sakimyto.com/fonts/${font}.woff2`, { method }),
          env as never,
          {} as ExecutionContext,
        )
        expect(response.status).toBe(method === 'POST' ? 405 : 200)
        if (method !== 'POST') {
          expect(response.headers.get('content-type')).toBe('font/woff2')
          expect(response.headers.get('x-content-type-options')).toBe('nosniff')
          const bytes = await response.arrayBuffer()
          expect(bytes.byteLength).toBe(
            method === 'HEAD' ? 0 : Number(response.headers.get('content-length')),
          )
          if (method === 'GET') {
            expect(bytes.byteLength).toBeGreaterThan(1000)
            expect(createHash('sha256').update(new Uint8Array(bytes)).digest('hex')).toBe(
              createHash('sha256')
                .update(new Uint8Array(readFileSync(`assets/site/${font}.woff2`)))
                .digest('hex'),
            )
          }
        }
      })
    }
  for (const host of ['devcard.sakimyto.com', 'devcard-ai.sakimyto.workers.dev'])
    for (const font of ['Geist', 'GeistMono']) {
      it(`preserves ${host} redirect for ${font}`, async () => {
        const response = await worker.fetch(
          new Request(`https://${host}/fonts/${font}.woff2`),
          {} as never,
          {} as ExecutionContext,
        )
        expect(response.status).toBe(301)
        expect(response.headers.get('location')).toBe(
          `https://pullcard.sakimyto.com/fonts/${font}.woff2`,
        )
      })
    }
  for (const path of [
    '/fonts/unknown.woff2',
    '/fonts/Geist.woff2/extra',
    '/fonts/Geist.woff',
    '/fonts/__proto__',
  ]) {
    it(`does not turn ${path} into an asset route`, async () => {
      const response = await worker.fetch(
        new Request(`https://pullcard.sakimyto.com${path}`),
        {} as never,
        {} as ExecutionContext,
      )
      expect(response.status).toBe(400)
    })
  }
})

for (const method of ['GET', 'HEAD', 'POST'])
  it(`bundled icon ${method} avoids application bindings`, async () => {
    const env = new Proxy(
      {},
      {
        get() {
          throw new Error('PC5 touched environment')
        },
      },
    )
    const response = await worker.fetch(
      new Request('https://pullcard.sakimyto.com/site/icon.png', { method }),
      env as never,
      {} as ExecutionContext,
    )
    expect(response.status).toBe(method === 'POST' ? 405 : 200)
    if (method !== 'POST') {
      expect(response.headers.get('content-type')).toBe('image/png')
      const bytes = new Uint8Array(await response.arrayBuffer())
      expect(bytes.byteLength).toBe(
        method === 'HEAD' ? 0 : Number(response.headers.get('content-length')),
      )
      if (method === 'GET')
        expect([...bytes.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    }
  })

for (const host of ['devcard.sakimyto.com', 'devcard-ai.sakimyto.workers.dev'])
  it(`legacy icon redirect ${host}`, async () => {
    const response = await worker.fetch(
      new Request(`https://${host}/site/icon.png`),
      {} as never,
      {} as ExecutionContext,
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://pullcard.sakimyto.com/site/icon.png')
  })
it('does not serve arbitrary icon paths', async () => {
  const response = await worker.fetch(
    new Request('https://pullcard.sakimyto.com/site/icon.png/extra'),
    {} as never,
    {} as ExecutionContext,
  )
  expect(response.status).toBe(400)
})
