# CLAUDE.md - Project Instructions for Claude Code

## Project Overview

Vim.js is a lightweight Vim keybinding library for web `textarea` and `input` fields. It uses a CommonJS module system internally, bundled with Vite into UMD format.

## Build System

- **Bundler**: Vite with `@rollup/plugin-commonjs`
- **Build command**: `npm run build` (unminified) and `npm run build_min` (minified)
- **Build artifacts**: `build/vim.js`, `build/vim.js.map`, `build/vim.min.js`
- **Test runner**: Vitest (`npm test`)

## Important: Build Before Committing Source Changes

**Always rebuild and commit build artifacts when source files under `src/` change.**

The `build/` directory contains committed artifacts that are served via CDN. If you modify any file under `src/`, you must:

1. Run `npm run build` (produces `build/vim.js` and `build/vim.js.map`)
2. Run `npm run build_min` (produces `build/vim.min.js`)
3. Include all changed build artifacts in the commit

Forgetting this step means the CDN serves stale code that doesn't include your changes.

## Architecture

- `src/index.js` — Entry point, exports the `vim` API
- `src/instance/app/app.js` — App core: init, parseRoute, undo/redo, dot repeat
- `src/instance/app/init.js` — App state initialization
- `src/instance/controller.js` — Command implementations (motions, operators, text objects, search)
- `src/instance/vim/vim.js` — Vim operations (cursor movement, text manipulation, text object ranges)
- `src/instance/vim/init.js` — Vim state initialization
- `src/instance/text/text.js` — TextUtil: low-level text/cursor operations on the DOM element
- `src/instance/router/router.js` — Route registration for keybindings
- `src/routes.js` — All keybinding definitions (keycodes → controller methods)
- `src/bind.js` — DOM event listeners (keydown/keyup), handles pending states (findChar, textObject, search)
- `src/config.js` — Default configuration

## Testing

- Tests live in `test/` and use Vitest
- `test/helpers/setup.js` — Test factory: wires up App → Controller → Vim → TextUtil with a mock DOM element, bypassing `bind.js`
- `test/helpers/mock-element.js` — Mock DOM element (value, selectionStart/End, setSelectionRange, focus)
- `test/helpers/corpus.js` — 14 diverse text corpora for boundary testing
- Run `npm test` to execute all 6000+ tests
- Always run tests after source changes to verify no regressions

## Key Patterns

- **Compound keys**: Two-key sequences (e.g., `dd`, `dw`) use `isUnionCode()` with union codes like `68_87`
- **Operator-pending state**: Features like `f{char}`, text objects (`diw`), and search (`/{query}`) set a pending request on `vim` (e.g., `findCharRequest`, `textObjectRequest`), then `bind.js` captures the next character and dispatches to the controller
- **Record flag**: Routes with `.record(true)` auto-call `recordText()` before execution, enabling undo. Only text-modifying commands should have this flag.
- **Dot repeat**: `parseRoute` stores the last text-modifying command in `_lastDotCommand`. Pure motions are excluded.
