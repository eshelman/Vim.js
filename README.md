# Vim.js

Simple and lightweight Vim keybindings for web `textarea` and `input` fields, to improve the writing experience on the web.

[Demo here](https://6by9.net/vimjs-demo/)

**Note:**

* This project is not meant to replace powerful IDEs on web pages,
  but rather to enhance web-side writing (blogging, note-taking, etc.).

* Please use Vim commands with an English input method active.

# Usage

```html
<script src="/path/to/vim.js"></script>
<script>
    vim.open({
        debug   : true,
        showMsg : function(msg){
            alert('vim.js say:' + msg);
        }
    });
</script>
```

# Building

```bash
# install dependencies
npm install

# development (watch mode)
npm run dev

# production build (unminified)
npm run build

# production build (minified)
npm run build_min

# run tests
npm test

# run tests in watch mode
npm run test:watch
```

# Browser Support

* Chrome
* Firefox
* Safari

# Features

## General Mode

### Cursor Motions

| Command | Description |
| --- | --- |
| `h` or `Left` | Move left one character |
| `j` or `Down` or `Enter` | Move down one line |
| `k` or `Up` | Move up one line |
| `l` or `Right` | Move right one character |
| `0` or `Home` | Move to start of line |
| `$` or `End` | Move to end of line |
| `w` / `W` | Move to next word |
| `b` | Move to previous word |
| `B` | Move to previous WORD (whitespace-delimited) |
| `e` | Move to end of word |
| `E` | Move to end of WORD (whitespace-delimited) |
| `gg` | Go to first line |
| `G` | Go to last line |
| `f{char}` | Find character forward (move to it) |
| `F{char}` | Find character backward |
| `t{char}` | Move till (just before) character forward |
| `T{char}` | Move till character backward |
| `;` | Repeat last `f`/`F`/`t`/`T` in same direction |
| `,` | Repeat last `f`/`F`/`t`/`T` in opposite direction |
| `(` | Move to previous sentence |
| `)` | Move to next sentence |
| `{` | Move to previous paragraph |
| `}` | Move to next paragraph |

All motions accept a count prefix (e.g., `3w`, `5j`, `2f{char}`).

### Search

| Command | Description |
| --- | --- |
| `/{query}` | Search forward for text |
| `?{query}` | Search backward for text |
| `n` | Repeat last search in same direction |
| `N` | Repeat last search in opposite direction |
| `*` | Search forward for word under cursor |
| `#` | Search backward for word under cursor |

### Delete, Yank, and Paste

| Command | Description |
| --- | --- |
| `x` or `Delete` | Delete character under cursor |
| `X` | Delete character before cursor |
| `dd` | Delete current line |
| `dw` | Delete word forward |
| `db` | Delete word backward |
| `df{char}` | Delete through next occurrence of character |
| `dF{char}` | Delete through previous occurrence of character |
| `dt{char}` | Delete till next occurrence of character |
| `dT{char}` | Delete till previous occurrence of character |
| `yy` | Yank (copy) current line |
| `yw` | Yank word forward |
| `yb` | Yank word backward |
| `yf{char}` | Yank through next occurrence of character |
| `yF{char}` | Yank through previous occurrence of character |
| `yt{char}` | Yank till next occurrence of character |
| `yT{char}` | Yank till previous occurrence of character |
| `p` | Paste after cursor |
| `P` | Paste before cursor |

Delete and yank commands accept a count prefix (e.g., `3dd`, `2dw`).

### Text Objects

Text objects work with delete (`d`), yank (`y`), and change (`c`) operators:

| Command | Description |
| --- | --- |
| `diw` / `daw` | Delete inner word / a word (includes surrounding space) |
| `ciw` / `caw` | Change inner word / a word |
| `yiw` / `yaw` | Yank inner word / a word |
| `di"` / `da"` | Delete inside double quotes / including quotes |
| `di'` / `da'` | Delete inside single quotes / including quotes |
| `di(` / `da(` | Delete inside parentheses / including parens |
| `di{` / `da{` | Delete inside curly braces / including braces |
| `di[` / `da[` | Delete inside square brackets / including brackets |

The `ci` and `yi` variants work the same way with their respective operators.

### Change (Delete + Enter Edit Mode)

| Command | Description |
| --- | --- |
| `cc` | Change entire line |
| `cw` | Change word forward |
| `cb` | Change word backward |
| `C` | Change from cursor to end of line |
| `s` | Substitute character (delete and enter edit mode) |
| `S` | Substitute line (same as `cc`) |

### Undo, Redo, and Repeat

| Command | Description |
| --- | --- |
| `u` | Undo (supports multiple levels) |
| `Ctrl+R` | Redo |
| `.` | Repeat last edit command |

Undo operates per edit session: typing in edit mode is undone as a single unit, not character by character. New edits after undo clear the redo history (matching Vim behavior).

## Edit Mode

| Command | Description |
| --- | --- |
| `i` | Insert at cursor |
| `I` | Insert at start of line |
| `a` | Append after cursor |
| `A` | Append at end of line |
| `o` | Open new line below and enter edit mode |
| `O` | Open new line above and enter edit mode |
| `r` | Replace character under cursor |
| `Esc` | Return to general mode |

## Visual Mode

| Command | Description |
| --- | --- |
| `v` / `V` | Toggle visual mode (character selection) |
| `y` | Yank (copy) selected text |
| `x` / `d` | Delete selected text |
| `c` | Change selected text (delete and enter edit mode) |

Use any motion command to extend the selection before applying an operator.

# Testing

Vim.js includes a comprehensive test suite with 6000+ test cases powered by [Vitest](https://vitest.dev/):

```bash
npm test
```

Tests cover motions, operators, text objects, search, undo/redo, mode transitions, count prefixes, and boundary conditions across 14 diverse text corpora.

# License

MIT
