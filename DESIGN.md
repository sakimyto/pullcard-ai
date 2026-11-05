# Shared site design

PullCard adopts the sakimyto.com design system as publicly displayed on 2026-11-05. The previous landing page used a dark GitHub-like palette, system fonts, small rectangular controls, and no site header. The shared shell uses the shared semantic colors, Geist, 20/24px surfaces, pill controls, and the floating header. The card artwork and generation behavior remain specific to PullCard.

| Before | After | Why |
| --- | --- | --- |
| No shared header | Home icon, service home link, local menu, explicit All services link | Separate identity and navigation |
| Theme choices precede the username | Username and primary action precede appearance controls | Keep the main action visible on small screens with 44px choices |
| Dark-only page | Dark default with a saved light/dark preference | Match the shared system |
| Small choices and ungated hover | 44px choices, visible focus, pointer-aware hover | Keep touch and keyboard controls usable |

## Invariants

- PC1: The shared icon links to https://sakimyto.com/, the service name to /, and All services to https://sakimyto.com/lab. Names never open a service selector.
- PC2: Existing content, form IDs, theme/glow values, app script, links, canonical URL, creator and Lab relationship remain intact. The primary input block moves before appearance controls; only its auto-capitalization, auto-correction and keyboard action hints are added.
- PC3: Shared semantic colors, local Geist fonts, 20px panels, 24px shell, and 44px controls work in dark/light at 320/375/768/1280px. Inputs remain 16px and zoom stays enabled.
- PC4: The native mobile disclosure closes on Escape (restoring focus), outside pointer, and link choice. Theme changes work even when storage is unavailable. Native details behavior and actual focus are also checked in the browser.
- PC5: Static UI routes only serve the two bundled fonts and the shared icon for GET/HEAD. They do not access GitHub, KV, analytics, or rate limits. Legacy hosts still redirect before any resource route. Other API contracts remain intact.
- PC6: No preview/decorative stop or play buttons. No new automatic motion; existing image swaps respect reduced motion.

The page remains a small server-rendered Worker template. No React, Tailwind build pipeline, or duplicate component library is added to this service. Shared values and shell markup live in src/site-design.ts; card themes in src/svg remain unchanged. Fonts and the shared icon are served locally. The main site's fonts do not allow cross-origin font requests, and the externally loaded icon failed in the browser check.

## Verification

Freeze the actual pre-change content and app script. Compare the new output after canonicalizing only the primary block position. Enumerate mobile menu/theme operations against the emitted script with a bounded DOM model, then check native behavior in a browser. Deliberately wrong home/directory targets, script guards, content and metadata must be rejected. Use existing API, rendering, swap, type, lint and Worker config gates.

Worst cases use the actual boundaries: GitHub usernames of 1 and 39 characters, empty input and rejected punctuation; gallery counts 0/1/24; missing optional gallery text; long permitted names and the current 10,200 maximum power (six 0–100 scores × 17). Existing fixtures and mocks provide data; tests never call the real GitHub API. Any development fixture selector stays out of the production output. Test the responsive shell, theme, focus, loading/error behavior and 200% text. Device emulation does not verify phone keyboard, notch, tap feel or screen readers.

These are finite template/state/API checks with no concurrency or permission changes. Z3/TLA+ is not needed. Record red/green results, broken variants, exact gates and limitations here. Deploying production is a separate operation.

The development fixture selector lives in tests/design-preview-worker.ts and uses the real landing template, script, font routes and SVG renderer. Its API responses contain only deterministic fixture data; it never forwards credentials, bindings or upstream requests. The dedicated tests/design-preview.wrangler.jsonc has no account, routes or storage bindings. Use `bunx wrangler dev --config tests/design-preview.wrangler.jsonc --local --persist-to <fresh temporary directory>` to inspect Demo data / Worst case / Empty / One. Production still starts at api/index.ts.

## Results

The original page failed the new shell/script checks (3 failures); the content oracle passed. The font route tests then failed with the expected status assertions (6 failures), and the local-icon tests failed before that resource was added (3 failures). A hover-position regression check also failed before the old gallery lift and its unused reduced-motion reset were removed. These were behavior/assertion failures, not dependency or syntax errors.

The emitted menu/theme script passed 456 bounded operation sequences (up to two actions, two initial menu states, two initial themes, storage available/unavailable). Four valid broken scripts were rejected for focus, Escape, outside dismissal and theme behavior. The content/SEO oracle rejected changed home/directory targets, input IDs, text, allowed username length and title. The original application script remains byte-identical.

The browser fixture checked 32 combinations: 320/375/768/1280px × dark/light × demo/worst/empty/one. Header/choice targets stayed at least 44px, the primary action stayed in the first view, and overflow, missing fonts/icons and heading/header overlap were absent. The 39-character login, 24-card gallery, single item and empty gallery worked. Card selection, theme/glow changes, all loaded image resources, generated markdown, invalid-input feedback, outside dismissal, Escape focus and the service-name home link were also checked. Runtime error logs were empty. The shared icon was changed from a failed external image request to its bundled local resource.

The dedicated development Worker originally rejected primitive named exports; moving fixture data to tests/fixtures/designData.ts fixed the runtime boundary. Both the fixture selector and its data remain outside the production entry. The preview used an empty environment file, a separate local persistence folder and no account/storage bindings. No real GitHub API requests were made.

Phone hardware, software keyboard behavior, actual notch insets, 200% browser zoom and screen readers remain unverified. Native disclosure/focus checks used the connected Chromium browser; this is not a guarantee for every browser. The visible card statistics in saved screenshots are development fixtures. Production deployment has not been performed.

All 544 tests in 37 files, TypeScript and Biome passed. The production Worker configuration dry run passed with the existing bindings. A final eight responsive theme checks confirmed that both form inputs and buttons use Geist; first-view placement, 44px controls and horizontal overflow checks still passed.
