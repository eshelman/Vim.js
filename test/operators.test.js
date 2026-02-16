import { describe, test, expect } from 'vitest';
import { setup, pressKey, pressCompoundKey, pressFindChar, pressOperatorFindChar, KEY } from './helpers/setup.js';

function getCursor(env) {
  return env.el.selectionStart;
}
function getText(env) {
  return env.el.value;
}

describe('x - delete character under cursor', () => {
  test.each([
    { desc: 'middle of text', text: 'abcdef', cursor: 2, expectedText: 'abdef', expectedCursor: 2 },
    { desc: 'first character', text: 'abcdef', cursor: 0, expectedText: 'bcdef', expectedCursor: 0 },
    { desc: 'single character', text: 'x', cursor: 0, expectedText: ' ', expectedCursor: 0 },
  ])('$desc', ({ text, cursor, expectedText, expectedCursor }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.X);
    expect(getText(env)).toBe(expectedText);
    expect(getCursor(env)).toBe(expectedCursor);
  });
});

describe('dd - delete current line', () => {
  test('delete middle line', () => {
    var env = setup('abc\ndef\nghi', 4);
    pressCompoundKey(env.app, KEY.D, KEY.D);
    expect(getText(env)).toBe('abc\nghi');
  });

  test('delete first line', () => {
    var env = setup('abc\ndef', 1);
    pressCompoundKey(env.app, KEY.D, KEY.D);
    // After deleting "abc\n", text should be "def"
    expect(getText(env)).toBe('def');
  });

  test('delete only line leaves space', () => {
    var env = setup('hello', 0);
    pressCompoundKey(env.app, KEY.D, KEY.D);
    // TextUtil.delete replaces empty with ' '
    expect(getText(env)).toBe(' ');
  });
});

describe('dw - delete word', () => {
  test('delete first word', () => {
    var env = setup('hello world', 0);
    pressCompoundKey(env.app, KEY.D, KEY.W);
    // Deletes from cursor to next word boundary
    expect(getText(env)).toBe('world');
    expect(getCursor(env)).toBe(0);
  });

  test('delete middle word', () => {
    var env = setup('hello world foo', 6);
    pressCompoundKey(env.app, KEY.D, KEY.W);
    var text = getText(env);
    // Should delete "world" up to "foo"
    expect(text).toBe('hello foo');
  });
});

describe('db - delete previous word', () => {
  test('delete previous word', () => {
    var env = setup('hello world', 6);
    pressCompoundKey(env.app, KEY.D, KEY.B);
    expect(getText(env)).toBe('world');
    expect(getCursor(env)).toBe(0);
  });
});

describe('df{char} - delete through char', () => {
  test('delete through next o', () => {
    var env = setup('hello world', 0);
    pressOperatorFindChar(env.app, KEY.D, KEY.F, false, 'o');
    expect(getText(env)).toBe(' world');
    expect(getCursor(env)).toBe(0);
  });
});

describe('dt{char} - delete till char', () => {
  test('delete till next o', () => {
    var env = setup('hello world', 0);
    pressOperatorFindChar(env.app, KEY.D, KEY.T, false, 'o');
    expect(getText(env)).toBe('o world');
    expect(getCursor(env)).toBe(0);
  });
});

describe('cc - change line', () => {
  test('clears line content', () => {
    var env = setup('abc\nhello\ndef', 4);
    pressCompoundKey(env.app, KEY.C, KEY.C);
    // Line content should be deleted, mode should switch to edit
    expect(getText(env)).toBe('abc\n\ndef');
  });
});

describe('cw - change word', () => {
  test('deletes word and prepares for insert', () => {
    var env = setup('hello world', 0);
    pressCompoundKey(env.app, KEY.C, KEY.W);
    expect(getText(env)).toBe('world');
    expect(getCursor(env)).toBe(0);
  });
});

describe('cb - change previous word', () => {
  test('deletes previous word', () => {
    var env = setup('hello world', 6);
    pressCompoundKey(env.app, KEY.C, KEY.B);
    expect(getText(env)).toBe('world');
    expect(getCursor(env)).toBe(0);
  });
});

describe('C - change to end of line', () => {
  test('deletes from cursor to end of line', () => {
    var env = setup('hello world', 5);
    pressKey(env.app, KEY.C, { shift: true });
    expect(getText(env)).toBe('hello');
  });
});

describe('s - substitute character', () => {
  test('deletes char under cursor', () => {
    var env = setup('hello', 2);
    pressKey(env.app, KEY.S);
    expect(getText(env)).toBe('helo');
    expect(getCursor(env)).toBe(2);
  });
});

describe('S - substitute line (alias for cc)', () => {
  test('clears line content', () => {
    var env = setup('hello', 2);
    pressKey(env.app, KEY.S, { shift: true });
    expect(getText(env)).toBe(' ');
  });
});

describe('yy - yank line + p - paste after', () => {
  test('yank and paste line', () => {
    var env = setup('abc\ndef', 0);
    pressCompoundKey(env.app, KEY.Y, KEY.Y);
    // repeatAction strips trailing newline on last iteration
    expect(env.app.clipboard).toBe('abc');
    // Move to second line and paste
    pressKey(env.app, KEY.J);
    pressKey(env.app, KEY.P);
    expect(getText(env)).toContain('abc');
  });
});

describe('yw - yank word', () => {
  test('yanks current word to clipboard', () => {
    var env = setup('hello world', 0);
    pressCompoundKey(env.app, KEY.Y, KEY.W);
    expect(env.app.clipboard).toBe('hello ');
  });
});

describe('yb - yank previous word', () => {
  test('yanks previous word to clipboard', () => {
    var env = setup('hello world', 6);
    pressCompoundKey(env.app, KEY.Y, KEY.B);
    expect(env.app.clipboard).toBe('hello ');
  });
});

describe('yf{char} - yank through char', () => {
  test('yanks through next o', () => {
    var env = setup('hello world', 0);
    pressOperatorFindChar(env.app, KEY.Y, KEY.F, false, 'o');
    expect(env.app.clipboard).toBe('hello');
  });
});

describe('P - paste before', () => {
  test('paste before cursor', () => {
    var env = setup('world', 0);
    env.app.clipboard = 'hello ';
    env.app.vim.pasteInNewLineRequest = false;
    pressKey(env.app, KEY.P, { shift: true });
    expect(getText(env)).toBe('hello world');
  });
});

describe('u - undo', () => {
  test('restores previous state', () => {
    var env = setup('hello world', 0);
    // Record initial state
    env.app.recordText();
    // Delete a word
    pressCompoundKey(env.app, KEY.D, KEY.W);
    expect(getText(env)).toBe('world');
    // Undo
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello world');
  });
});

describe('. - dot repeat', () => {
  test('repeats delete word', () => {
    var env = setup('aaa bbb ccc', 0);
    pressCompoundKey(env.app, KEY.D, KEY.W);
    expect(getText(env)).toBe('bbb ccc');
    pressKey(env.app, KEY.DOT);
    expect(getText(env)).toBe('ccc');
  });

  test('repeats x', () => {
    var env = setup('abcde', 0);
    pressKey(env.app, KEY.X);
    expect(getText(env)).toBe('bcde');
    pressKey(env.app, KEY.DOT);
    expect(getText(env)).toBe('cde');
  });
});
