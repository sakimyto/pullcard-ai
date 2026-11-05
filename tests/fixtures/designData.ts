import type { GalleryEntry } from '../../src/gallery'

export const LONG_LOGIN = 'platform-infrastructure-tooling-team-01' // GitHub's 39-character limit.
export const MODES = ['demo', 'worst', 'empty', 'one'] as const
export function galleryFixture(mode: string): GalleryEntry[] {
  if (mode === 'empty') return []
  if (mode === 'one') return [{ user: 'j', at: 0, power: 17 }]
  if (mode === 'worst')
    return Array.from({ length: 24 }, (_, i) => ({
      user: i === 0 ? LONG_LOGIN : i === 1 ? 'j' : `platform-builder-${i}`,
      at: 0,
      ...(i === 2 ? {} : { power: i === 0 ? 10200 : i === 1 ? 0 : 6307 }),
      ...(i % 2
        ? {}
        : { element: 'bolt', epithet: 'Platform infrastructure — next generation tooling' }),
    }))
  return [{ user: 'sample-builder', at: 0, power: 6307, element: 'bolt' }]
}
