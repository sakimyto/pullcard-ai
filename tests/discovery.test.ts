import assert from 'node:assert/strict'
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from '../api/index'
import { discoveryResponse } from '../src/discovery'

afterEach(() => vi.unstubAllGlobals())
async function verify(handler: typeof discoveryResponse) {
  for (const path of ['/robots.txt', '/sitemap.xml'])
    for (const method of ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH']) {
      const response = handler(
        new Request(`https://pullcard.sakimyto.com${path}?user=untrusted&other=%3Cscript%3E`, {
          method,
        }),
      )
      assert(response, 'CD1 known discovery path')
      assert.equal(
        response.status,
        ['GET', 'HEAD'].includes(method) ? 200 : 405,
        'CD1 method boundary',
      )
      const body = await response.text()
      if (method === 'HEAD' || response.status === 405)
        assert.equal(body, '', 'CD1 empty HEAD/write response')
      if (method === 'GET') {
        if (path === '/robots.txt') {
          assert(body.includes('User-agent: OAI-SearchBot\nAllow: /'), 'CD3 search bot')
          assert(!body.includes('GPTBot'), 'CD3 no training declaration')
          assert(
            body.includes('Sitemap: https://pullcard.sakimyto.com/sitemap.xml'),
            'CD3 canonical sitemap',
          )
        } else
          assert.equal(
            body.match(/<loc>(.*?)<\/loc>/)?.[1],
            'https://pullcard.sakimyto.com/',
            'CD3 canonical landing only',
          )
        assert(!body.includes('untrusted'), 'CD3 no query reflection')
      }
    }
  assert.equal(
    handler(new Request('https://pullcard.sakimyto.com/robots.txt/extra')),
    null,
    'CD2 exact path only',
  )
}
describe('CD1–3 crawler discovery', () => {
  it('uses actual response code for the 12 method/path states', async () =>
    verify(discoveryResponse))
  for (const host of [
    'pullcard.sakimyto.com',
    'devcard.sakimyto.com',
    'devcard-ai.sakimyto.workers.dev',
  ])
    for (const path of ['/robots.txt', '/sitemap.xml'])
      for (const method of ['GET', 'HEAD', 'POST']) {
        it(`${host} ${method} ${path} keeps redirects and avoids all app resources`, async () => {
          const env = new Proxy(
            {},
            {
              get() {
                throw Error('CD1 application environment touched')
              },
            },
          )
          vi.stubGlobal(
            'caches',
            new Proxy(
              {},
              {
                get() {
                  throw Error('CD1 application cache touched')
                },
              },
            ),
          )
          const response = await worker.fetch(
            new Request(`https://${host}${path}?other=kept`, { method }),
            env as never,
            {} as ExecutionContext,
          )
          if (host !== 'pullcard.sakimyto.com') {
            expect(response.status).toBe(301)
            expect(response.headers.get('location')).toBe(
              `https://pullcard.sakimyto.com${path}?other=kept`,
            )
          } else {
            expect(response.status).toBe(method === 'POST' ? 405 : 200)
            if (method === 'HEAD') expect(await response.text()).toBe('')
          }
        })
      }
})

it('CD1–3 rejects four valid broken implementations with the same HTTP oracle', async () => {
  const source = discoveryResponse.toString()
  for (const [from, to] of [
    ["request.method !== 'GET' && request.method !== 'HEAD'", 'false'],
    ["request.method === 'HEAD' ? null : body", 'body'],
    ['https://pullcard.sakimyto.com/', 'https://wrong.invalid/'],
    ['OAI-SearchBot', 'GPTBot'],
  ]) {
    const anchor = source.includes(from) ? from : from.replaceAll("'", '"')
    assert(source.includes(anchor), `CD mutation anchor ${from}`)
    const broken = new Function(
      `return (${source.replaceAll(anchor, to)})`,
    )() as typeof discoveryResponse
    await expect(verify(broken)).rejects.toThrow(assert.AssertionError)
  }
})
