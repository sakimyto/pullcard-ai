# PullCard AI (repo: pullcard-ai)

AI coding style trading card generator for GitHub profiles. Canonical URL: https://pullcard.sakimyto.com (legacy devcard.sakimyto.com 301s here — never remove that route).

## Commands
- `bun run test` — run tests (Vitest; loads vitest.config.ts binary loader for wasm/fonts — `bun test` native can't run the resvg pixel test)
- `bun run dev` — local Cloudflare Worker
- `bun run typecheck` — type check
- `bun run lint` — lint with Biome

## Architecture
- `api/index.ts` — Cloudflare Workers entry
- `src/github/` — GitHub GraphQL client
- `src/analyzers/` — Data analysis (coauthor, tools, score)
- `src/svg/` — SVG card generation
- `src/handler.ts` — Request orchestration

## Rules
- UI・アニメーションの作成・修正・レビューでは、[emilkowalski/skills](https://github.com/emilkowalski/skills) の該当スキルを使う。
- 表示崩れのテストには `break-ui`、スマホ向けの調整には `mobile-native` を使い、既存のデザイン規約・デザインシステムを優先する。
- 画面がAIっぽく見えるとき（紫のグラデーション、光り、絵文字ラベル、不揃いな余白など）は unslop スキル（heydamir/unslop）で直す。

- Preview/decorative motion has no stop/play control: start still or become still within 4.5 seconds, and respect reduced motion. Interactive product controls are separate.
- Shared page design lives in `DESIGN.md` and `src/site-design.ts`; keep card artwork independent.
- Pure SVG only (no foreignObject, no satori)
- All analyzers are pure functions with typed inputs/outputs
- Tests use fixture data, never hit real GitHub API

## ツール利用の共通方針

- ブラウザ（Chrome）操作は、API・CLI・接続済みアプリで実施できない場合の最後の手段とする。どの手段でも既存の承認・権限・制限は迂回しない。
- 繰り返しや大量データなどの重い処理は、手作業やブラウザ操作で続けずスクリプト化する。
- 作業で開いた不要なタブは、成功・失敗・中断に関わらず終了時に閉じる。ユーザーが元から開いていたタブは閉じない。
