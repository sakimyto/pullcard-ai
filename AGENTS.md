# PullCard AI (repo: pullcard-ai)

AI coding style trading card generator for GitHub profiles. Canonical URL: https://pullcard.sakimyto.com (legacy devcard.sakimyto.com 301s here — never remove that route).

## Commands
- `bun run test` — run tests (Vitest; loads vitest.config.ts binary loader for wasm/fonts — `bun test` native can't run the resvg pixel test)
- `bun run dev` — local Vercel dev server
- `bun run typecheck` — type check
- `bun run lint` — lint with Biome

## Architecture
- `api/index.ts` — Vercel Edge Function entry
- `src/github/` — GitHub GraphQL client
- `src/analyzers/` — Data analysis (coauthor, tools, score)
- `src/svg/` — SVG card generation
- `src/handler.ts` — Request orchestration

## Rules
- UI・アニメーションの作成・修正・レビューでは、[emilkowalski/skills](https://github.com/emilkowalski/skills) の該当スキルを使う。
- 表示崩れのテストには `break-ui`、スマホ向けの調整には `mobile-native` を使い、既存のデザイン規約・デザインシステムを優先する。
- 画面がAIっぽく見えるとき（紫のグラデーション、光り、絵文字ラベル、不揃いな余白など）は unslop スキル（heydamir/unslop）で直す。

- Pure SVG only (no foreignObject, no satori)
- All analyzers are pure functions with typed inputs/outputs
- Tests use fixture data, never hit real GitHub API

## 開発の分担と引き継ぎ（P1、2026-10-24決定）

- Claude Code は調査・計画・設計・レビューを担当し、Codex は実装と2回目のレビューを担当する。
- 共通ルールは `AGENTS.md` を正本とし、`CLAUDE.md` は `@AGENTS.md` の参照だけにする。
- 引き継ぎは会話ではなく、`PLAN.md`（目的・変更範囲・完了条件・実行コマンド・未決事項）と `STATUS.md`（進捗）に残す。

## 文脈・決定・ノウハウの記録（P2、2026-10-28決定）

- 文脈・経緯・決定・ノウハウはbotの記憶にとどめず、このリポジトリの `docs/`・PR・issue に残す。
