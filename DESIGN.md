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

The asset-route checker detected all five valid source mutations (method restriction, legacy redirect, HEAD body, font bytes and arbitrary font paths). Both the unchanged and restored controls passed. Production dependency audit passed. The checker runs in CI and restores the source after each case.

## Discovery and first-use follow-up (2026-11-07)

PD1: Keep the card preview and primary action visible sooner on phones by placing the existing theme/glow controls in a native, initially closed disclosure. Every radio, theme and glow remains available. Keep the application script, card artwork, generation, cache, gallery opt-in and upstream limits unchanged.

PD2: Provide a main landmark, persistent username guidance and a live error/status description. Announce copy feedback through the existing button. Include concise visible instructions about public data, the 12-week window and README use; do not imply that inferred signals measure a person's ability.

PD3: Supply Open Graph and Twitter metadata using the same existing preview user, theme and glow as the visible example. Canonical, app identity and the actual card endpoint remain intact. No AI-only text, fabricated reviews or FAQ markup.

Validate the actual emitted page, collapsed controls and browser interactions with fixture responses only. Project only the explicitly added markup back to the original content oracle; keep the original app-script digest exact. Test changed access labels and destinations as counterexamples. Use current test, lint, types, static-resource mutations and config gates before merging and releasing. These are finite DOM/template contracts; no database, AI call or concurrency policy changes are introduced.

The original landing failed the new first-use tests before implementation. The final checks pass: 549 tests in 38 files, types, Biome, five real static-resource source mutations, Worker dry-run and production dependency audit. The original application-script hash remains exact. Four valid broken templates fail for the main landmark, disclosure state, live status and matching share image; the previous content/metadata oracle still catches changes outside the approved additions.

Chromium and WebKit each checked 320/390/768/1280px in both themes: 16 views total. The real example card intersects the initial viewport, the native appearance disclosure opens and closes, visible radio labels change the selected values, invalid usernames produce live guidance, and the 39-character fixture login produces markdown with the chosen appearance. No page errors or horizontal overflow occurred. Fixture requests never access GitHub, KV, bindings or an external AI. Actual phone keyboards and screen readers are outside this browser evidence.

## Crawler discovery follow-up (2026-11-07)

The public `/robots.txt` returned 400 because unknown paths fall through to card validation. A missing/4xx robots file does not itself block Google; this change supplies an explicit search-crawler entry and a sitemap containing only the canonical landing URL. It does not claim indexing or ranking gains.

CD1: `/robots.txt` and `/sitemap.xml` serve GET/HEAD without GitHub, KV, analytics, cache access or rate-limit bindings. HEAD has the same headers and no body; other methods return 405. CD2: legacy domains redirect first, retaining path/query, and unknown paths keep their previous behavior. CD3: the sitemap includes only `https://pullcard.sakimyto.com/`; robots identifies Googlebot, bingbot and OAI-SearchBot. No GPTBot/Google-Extended/training policy is added. Query strings never alter these static documents.

Verify both documents across read/write methods and legacy/current hosts with throwing environment and cache proxies. Use the actual response helper for method, HEAD, canonical and bot-name counterexamples. References checked 2026-11-07: https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec and https://developers.openai.com/api/docs/bots . These are finite HTTP dispatch contracts with no new state or concurrency, so exhaustive cases and negative variants are sufficient.
