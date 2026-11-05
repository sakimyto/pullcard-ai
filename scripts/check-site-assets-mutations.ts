// Serial source mutations. Stop preview/build/test processes in this checkout first.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const file = 'api/index.ts'
const test = 'tests/site-assets.test.ts'
assert.equal(
  spawnSync('git', ['status', '--porcelain', '--', file, test], { encoding: 'utf8' }).stdout.trim(),
  '',
  'commit the tested source first',
)
assert.equal(
  spawnSync('git', ['ls-files', '--error-unmatch', file, test]).status,
  0,
  'tracked source and test required',
)
const original = readFileSync(file, 'utf8')
const restore = () => writeFileSync(file, original)
process.on('exit', restore)
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    restore()
    process.exit(130)
  })
const run = () =>
  spawnSync('bun', ['x', 'vitest', 'run', test, '--reporter=json'], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 2_000_000,
  })
const variants = [
  {
    name: 'method restriction',
    changes: [["if (req.method !== 'GET' && req.method !== 'HEAD')", 'if (false)']],
  },
  {
    name: 'legacy host redirect',
    changes: [['if (LEGACY_HOSTS.has(url.hostname))', 'if (false)']],
  },
  { name: 'HEAD body', changes: [["req.method === 'HEAD' ? null : asset.data", 'asset.data']] },
  {
    name: 'wrong font resource',
    changes: [["'/fonts/Geist.woff2': { data: geist,", "'/fonts/Geist.woff2': { data: geistMono,"]],
  },
  {
    name: 'arbitrary font path',
    changes: [
      [
        'Object.hasOwn(SITE_ASSETS, pathname)',
        "(Object.hasOwn(SITE_ASSETS, pathname) || pathname.startsWith('/fonts/'))",
      ],
      [
        'const asset = SITE_ASSETS[pathname]',
        "const asset = SITE_ASSETS[pathname] ?? SITE_ASSETS['/fonts/Geist.woff2']",
      ],
    ],
  },
]
assert.equal(run().status, 0, 'green asset control')
for (const variant of variants) {
  let changed = original
  for (const [from, to] of variant.changes) {
    assert.equal(changed.split(from).length, 2, `unique anchor: ${variant.name}`)
    changed = changed.replace(from, to)
  }
  try {
    writeFileSync(file, changed)
    const result = run()
    assert.equal(result.status, 1, `${variant.name}: ${result.stdout}${result.stderr}`)
    const report = JSON.parse(result.stdout)
    const failures = report.testResults
      .flatMap(
        (r: { assertionResults: { status: string; failureMessages: string[] }[] }) =>
          r.assertionResults,
      )
      .filter((r: { status: string }) => r.status === 'failed')
    assert(failures.length > 0, `failed assertions: ${variant.name}`)
    for (const failure of failures) {
      const message = failure.failureMessages.join('\n')
      assert.match(message, /AssertionError/)
      assert.doesNotMatch(
        message,
        /ReferenceError|TypeError|SyntaxError|Transform failed|Failed to resolve|timed out/,
      )
    }
    console.log(`Detected asset variant: ${variant.name}`)
  } finally {
    restore()
  }
}
assert.equal(run().status, 0, 'restored asset control')
console.log(`${variants.length} asset variants detected; green and restored controls passed`)
// On SIGKILL inspect git diff -- api/index.ts before restoring only deliberate edits.
