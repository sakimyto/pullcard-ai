// Shared sakimyto.com roles. Card artwork keeps its own palette and rendering.
export const SITE_STYLES = `
    @font-face { font-family: Geist; src: url('/fonts/Geist.woff2') format('woff2'); font-weight: 100 900; font-display: swap }
    @font-face { font-family: 'Geist Mono'; src: url('/fonts/GeistMono.woff2') format('woff2'); font-weight: 100 900; font-display: swap }
    :root {
      color-scheme: dark;
      --bg: #0c1020; --panel: #171c30; --border: #262c42;
      --text: #eceef3; --muted: #a2a8c0; --accent: #a9b1ff; --accent-soft: #161a44;
      --input: #7a8097; --on-accent: #0c1020; --primary: #eceef3; --on-primary: #0c1020;
      --font-sans: Geist, 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif;
      --font-mono: 'Geist Mono', ui-monospace, monospace;
      --radius-panel: 20px; --radius-shell: 24px; --header-space: calc(80px + env(safe-area-inset-top, 0px));
      --shadow-shell: 0 0 0 1px color-mix(in oklab, #fff 7%, transparent), inset 0 1px 0 color-mix(in oklab, #fff 4%, transparent), 0 2px 6px color-mix(in oklab, #000 40%, transparent);
      --shadow-menu: 0 0 0 1px color-mix(in oklab, #fff 10%, transparent), 0 16px 32px -8px color-mix(in oklab, #000 60%, transparent);
    }
    html.light {
      color-scheme: light;
      --bg: #f5f6f8; --panel: #fff; --border: #e1e4eb;
      --text: #0c1020; --muted: #565d75; --accent: #4b53cf; --accent-soft: #f1f2ff;
      --on-accent: #fff; --primary: #0c1020; --on-primary: #f5f6f8;
      --shadow-shell: 0 0 0 1px color-mix(in oklab, #0c1020 7%, transparent), 0 1px 2px color-mix(in oklab, #0c1020 5%, transparent), 0 2px 6px -1px color-mix(in oklab, #0c1020 6%, transparent);
      --shadow-menu: 0 0 0 1px color-mix(in oklab, #0c1020 8%, transparent), 0 16px 32px -8px color-mix(in oklab, #0c1020 16%, transparent);
    }
    html { scroll-padding-top: calc(var(--header-space) + 16px); -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent }
    button, input, select { font-family: var(--font-sans) }
    button, summary, .choice { touch-action: manipulation; user-select: none; -webkit-user-select: none }
    a { touch-action: manipulation; text-underline-offset: 4px }
    button:active, summary:active { transform: scale(.97) }
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }
    code, pre { font-family: var(--font-mono) }
    .app-header { position: fixed; top: calc(12px + env(safe-area-inset-top, 0px)); left: max(16px, env(safe-area-inset-left, 0px)); right: max(16px, env(safe-area-inset-right, 0px)); z-index: 20; max-width: 1200px; margin: 0 auto; height: 64px; display: flex; align-items: center; gap: 4px; padding: 0 12px; border-radius: var(--radius-shell); background: var(--panel); box-shadow: var(--shadow-shell) }
    .app-identity { display: flex; min-width: 0; align-items: center; gap: 4px; margin-right: auto }
    .app-home, .app-name, .app-header nav a { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; text-decoration: none; color: var(--text) }
    .app-home { flex-shrink: 0 }
    .app-home img { width: 30px; height: 30px; border-radius: 8px }
    .app-name span { min-width: 0; overflow: hidden; text-overflow: ellipsis }
    .app-name { padding: 0 8px; font-weight: 600; white-space: nowrap }
    .app-header nav a { padding: 0 12px; font-size: 14px; color: var(--muted) }
    .app-desktop-nav { display: flex; align-items: center; gap: 4px }
    .app-header button, .app-menu > summary { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; padding: 0; background: transparent; color: var(--muted); cursor: pointer }
    .app-header svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round }
    html:not(.light) .theme-moon, html.light .theme-sun { display: none }
    .app-menu { display: none }
    .app-menu > summary { list-style: none }
    .app-menu > summary::-webkit-details-marker { display: none }
    .app-menu nav { position: absolute; top: calc(100% + 8px); left: 0; right: 0; display: flex; flex-direction: column; padding: 8px; border-radius: var(--radius-shell); background: var(--panel); box-shadow: var(--shadow-menu); max-height: calc(100dvh - var(--header-space) - 24px); overflow-y: auto }
    .app-menu nav a { justify-content: flex-start; min-height: 48px; color: var(--text) }
    @media (hover: hover) and (pointer: fine) { .app-header a:hover, .app-header button:hover, .app-menu > summary:hover { background: var(--accent-soft); color: var(--text) } }
    @media (max-width: 1023px) { .app-desktop-nav { display: none } .app-menu { display: block } }
    @media (max-width: 639px) { :root { --header-space: calc(72px + env(safe-area-inset-top, 0px)) } .app-header { top: calc(8px + env(safe-area-inset-top, 0px)); left: max(8px, env(safe-area-inset-left, 0px)); right: max(8px, env(safe-area-inset-right, 0px)); height: 56px; padding: 0 8px } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } button:active, summary:active { transform: none } }
`
const menuLinks = `<a href="#hero">Create a card</a><a href="https://sakimyto.com/lab/pullcard">Record</a><a href="https://sakimyto.com/lab">All services</a>`
export const SITE_HEADER = `
  <header class="app-header" id="app-header">
    <div class="app-identity">
      <a class="app-home" href="https://sakimyto.com/" aria-label="sakimyto.com home"><img src="/site/icon.png" width="30" height="30" alt="" /></a>
      <a class="app-name" href="/"><span>PullCard AI</span></a>
    </div>
    <nav class="app-desktop-nav" aria-label="Service navigation">${menuLinks}</nav>
    <button type="button" id="site-theme-toggle" aria-label="Switch to light mode">
      <svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
      <svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/></svg>
    </button>
    <details class="app-menu" id="app-menu"><summary aria-label="Menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg></summary><nav aria-label="Mobile service navigation">${menuLinks}</nav></details>
  </header>`
export const THEME_INIT = `try { if (localStorage.getItem('theme') === 'light') document.documentElement.classList.add('light') } catch {}`
export const SITE_SCRIPT = `
(function () {
  function init() {
    const header = document.getElementById('app-header')
    const menu = document.getElementById('app-menu')
    const summary = document.querySelector('#app-menu > summary')
    const button = document.getElementById('site-theme-toggle')
    function label() {
      const light = document.documentElement.classList.contains('light')
      button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode')
      document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#ffffff' : '#171c30')
    }
    label()
    button.addEventListener('click', function () {
      const light = document.documentElement.classList.toggle('light')
      try { localStorage.setItem('theme', light ? 'light' : 'dark') } catch {}
      label()
    })
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.open) { menu.open = false; summary.focus() }
    })
    document.addEventListener('pointerdown', function (event) {
      if (!header.contains(event.target)) menu.open = false
    })
    header.addEventListener('click', function (event) {
      if (event.target.closest('a')) menu.open = false
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
`
