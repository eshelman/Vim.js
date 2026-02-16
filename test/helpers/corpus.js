/**
 * Diverse text corpus for testing vim keybindings.
 */

export const prose = 'The quick brown fox jumps over the lazy dog. She sells sea shells by the seashore.\n\nA new paragraph begins here. It has multiple sentences! Does it work?';

export const code = 'function hello(name) {\n  const msg = "Hello, " + name;\n  console.log(msg);\n  return { ok: true };\n}';

export const cjk = 'Hello world. \u4f60\u597d\u4e16\u754c\u3002This is mixed.';

export const singleLine = 'abcdefghij';

export const emptyLines = 'first line\n\n\nfourth line\n\nlast line';

export const oneChar = 'x';

export const symbols = 'a.b(c) [d] {e} f+g-h*i/j';

export const whitespace = '  hello  \n\tworld\t\n  indented  ';

// Realistic longer prose with multiple paragraphs and varied punctuation
export const article = [
  'The architecture of modern web applications has shifted dramatically over the past decade.',
  'Server-side rendering, once the default, gave way to single-page applications -- and now',
  'the pendulum swings back toward hybrid approaches like SSR + hydration.',
  '',
  '"The best tool depends on the job," said Dr. Jane Smith (CTO, Acme Corp). She noted that',
  "teams often over-engineer: \"You don't need a microservices mesh for a blog.\"",
  '',
  'Key takeaways:',
  '  1. Start simple; optimize later.',
  '  2. Measure before you refactor.',
  '  3. Ship early & iterate -- perfection is the enemy of progress!',
].join('\n');

// Markdown document with headers, lists, links, code fences, and emphasis
export const markdown = [
  '# Vim.js Test Plan',
  '',
  '## Overview',
  '',
  'This document describes the **automated test harness** for [Vim.js](https://github.com/toplan/Vim.js).',
  '',
  '### Goals',
  '',
  '- Catch regressions at *boundary positions* (pos 0, EOL, empty lines)',
  '- Verify every keybind across diverse text inputs',
  '- Run fast: < 1 second for 1000+ tests',
  '',
  '## Setup',
  '',
  '```bash',
  'npm install',
  'npm test',
  '```',
  '',
  '> **Note:** No browser required -- tests use a mock DOM element.',
  '',
  '| Corpus      | Purpose              |',
  '|-------------|----------------------|',
  '| `prose`     | Sentence/paragraph   |',
  '| `code`      | Symbol boundaries    |',
  '| `markdown`  | Mixed formatting     |',
  '',
  '---',
  '',
  'See also: `test/boundary.test.js` for the full matrix.',
].join('\n');

// Python code with decorators, docstrings, f-strings, nested structures
export const python = [
  'import os',
  'from typing import Optional, List',
  '',
  '',
  'class TokenBucket:',
  '    """Rate limiter using the token bucket algorithm.',
  '',
  '    Args:',
  '        rate: Tokens added per second.',
  '        capacity: Maximum burst size.',
  '    """',
  '',
  '    def __init__(self, rate: float, capacity: int = 10) -> None:',
  '        self._rate = rate',
  '        self._capacity = capacity',
  '        self._tokens = float(capacity)',
  '        self._last_refill = time.monotonic()',
  '',
  '    def _refill(self) -> None:',
  '        now = time.monotonic()',
  '        elapsed = now - self._last_refill',
  '        self._tokens = min(self._capacity, self._tokens + elapsed * self._rate)',
  '        self._last_refill = now',
  '',
  '    def consume(self, n: int = 1) -> bool:',
  '        """Try to consume n tokens. Returns True if allowed."""',
  '        self._refill()',
  '        if self._tokens >= n:',
  '            self._tokens -= n',
  '            return True',
  '        return False',
  '',
  '',
  '@app.route("/api/v1/items/<int:item_id>")',
  'def get_item(item_id: int) -> dict:',
  '    item = db.query(f"SELECT * FROM items WHERE id = {item_id}")',
  '    if item is None:',
  '        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")',
  '    return {"id": item.id, "name": item.name, "tags": item.tags or []}',
].join('\n');

// JSON config -- deeply nested, mixed value types
export const json = [
  '{',
  '  "name": "vim.js",',
  '  "version": "0.2.2",',
  '  "scripts": {',
  '    "test": "vitest run",',
  '    "build": "vite build"',
  '  },',
  '  "dependencies": {},',
  '  "devDependencies": {',
  '    "vite": "^6.1.0",',
  '    "vitest": "^3.0.0"',
  '  },',
  '  "config": {',
  '    "thresholds": [0.5, 0.75, 0.9, 0.95, 0.99],',
  '    "enabled": true,',
  '    "label": null',
  '  }',
  '}',
].join('\n');

// Git diff / patch output -- tabs, +/- prefixes, @@ headers
export const diff = [
  'diff --git a/src/index.js b/src/index.js',
  'index a1b2c3d..e4f5g6h 100644',
  '--- a/src/index.js',
  '+++ b/src/index.js',
  '@@ -10,7 +10,8 @@ function Router () {',
  '     this._init();',
  ' }',
  ' p = Router.prototype;',
  '-extend(p, require("./old/router.js"));',
  '+extend(p, require("./instance/router/router.js"));',
  '+// Updated path to match new directory structure',
  ' ',
  ' /**',
  '  * Vim constructor',
].join('\n');

// Long single line -- stress test for intra-line motions (w, e, f, etc.)
export const longLine = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

export const allCorpora = {
  prose,
  code,
  cjk,
  singleLine,
  emptyLines,
  oneChar,
  symbols,
  whitespace,
  article,
  markdown,
  python,
  json,
  diff,
  longLine,
};
