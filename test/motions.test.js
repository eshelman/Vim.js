import { describe, test, expect } from 'vitest';
import { setup, pressKey, pressCompoundKey, pressFindChar, KEY } from './helpers/setup.js';
import { prose, code, singleLine, symbols } from './helpers/corpus.js';

function getCursor(env) {
  return env.el.selectionStart;
}

describe('h - move left', () => {
  test.each([
    { desc: 'middle of line', text: singleLine, cursor: 5, expected: 4 },
    { desc: 'at position 1', text: singleLine, cursor: 1, expected: 0 },
    { desc: 'at position 0 (no-op)', text: singleLine, cursor: 0, expected: 0 },
    { desc: 'does not cross newline', text: 'ab\ncd', cursor: 3, expected: 3 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.H);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('l - move right', () => {
  test.each([
    { desc: 'middle of line', text: singleLine, cursor: 3, expected: 4 },
    { desc: 'at start', text: singleLine, cursor: 0, expected: 1 },
    { desc: 'at last char moves to text length', text: singleLine, cursor: 9, expected: 10 },
    { desc: 'does not cross newline', text: 'ab\ncd', cursor: 1, expected: 1 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.L);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('j - move down', () => {
  test.each([
    { desc: 'first to second line', text: 'abc\ndef\nghi', cursor: 1, expected: 5 },
    { desc: 'preserves column', text: 'abcd\nef\nghi', cursor: 3, expected: 6 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.J);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('k - move up', () => {
  test.each([
    { desc: 'second to first line', text: 'abc\ndef\nghi', cursor: 5, expected: 1 },
    { desc: 'preserves column', text: 'abcd\nef\nghi', cursor: 9, expected: 6 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.K);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('w - move to next word', () => {
  test.each([
    { desc: 'start of word to next', text: 'hello world foo', cursor: 0, expected: 6 },
    { desc: 'middle of word to next', text: 'hello world foo', cursor: 2, expected: 6 },
    { desc: 'across symbol boundary', text: symbols, cursor: 0, expected: 1 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.W);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('b - move to previous word', () => {
  test.each([
    { desc: 'start of second word to first', text: 'hello world', cursor: 6, expected: 0 },
    { desc: 'middle of word to start', text: 'hello world foo', cursor: 8, expected: 6 },
    { desc: 'at position 0 stays', text: 'hello', cursor: 0, expected: 0 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.B);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('B - move to previous WORD', () => {
  test.each([
    { desc: 'skips symbols', text: 'hello a.b world', cursor: 10, expected: 6 },
    { desc: 'basic big word', text: 'hello world', cursor: 6, expected: 0 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.B, { shift: true });
    expect(getCursor(env)).toBe(expected);
  });
});

describe('e - move to word end', () => {
  test.each([
    { desc: 'from start to end of first word', text: 'hello world', cursor: 0, expected: 4 },
    { desc: 'from end of word to end of next', text: 'hello world', cursor: 4, expected: 10 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.E);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('E - move to WORD end', () => {
  test.each([
    { desc: 'skips through symbols', text: 'a.b world', cursor: 0, expected: 2 },
    { desc: 'basic WORD end', text: 'hello world', cursor: 0, expected: 4 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.E, { shift: true });
    expect(getCursor(env)).toBe(expected);
  });
});

describe('0 - move to line head', () => {
  test.each([
    { desc: 'from middle to start', text: 'hello world', cursor: 5, expected: 0 },
    { desc: 'from second line middle to line start', text: 'abc\ndefgh', cursor: 6, expected: 4 },
    { desc: 'already at start', text: 'hello', cursor: 0, expected: 0 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.ZERO);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('$ - move to line tail', () => {
  test.each([
    { desc: 'from start to end', text: 'hello', cursor: 0, expected: 4 },
    { desc: 'from middle to end of first line', text: 'hello\nworld', cursor: 2, expected: 4 },
    { desc: 'already at end', text: 'hello', cursor: 4, expected: 4 },
  ])('$desc', ({ text, cursor, expected }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.FOUR, { shift: true });
    expect(getCursor(env)).toBe(expected);
  });
});

describe('gg - move to first line', () => {
  test('from middle of text to position 0', () => {
    var env = setup('abc\ndef\nghi', 5);
    pressCompoundKey(env.app, KEY.G, KEY.G);
    expect(getCursor(env)).toBe(0);
  });

  test('already at start', () => {
    var env = setup('abc\ndef', 0);
    pressCompoundKey(env.app, KEY.G, KEY.G);
    expect(getCursor(env)).toBe(0);
  });
});

describe('G - move to last line', () => {
  test('from start to last line', () => {
    var env = setup('abc\ndef\nghi', 0);
    pressKey(env.app, KEY.G, { shift: true });
    // Should move to start of last line
    expect(getCursor(env)).toBe(8);
  });
});

describe('f{char} - find forward', () => {
  test.each([
    { desc: 'find next o', text: 'hello world', cursor: 0, char: 'o', expected: 4 },
    { desc: 'find char not present (no-op)', text: 'hello', cursor: 0, char: 'z', expected: 0 },
  ])('$desc', ({ text, cursor, char, expected }) => {
    var env = setup(text, cursor);
    pressFindChar(env.app, KEY.F, false, char);
    expect(getCursor(env)).toBe(expected);
  });
});

describe('F{char} - find backward', () => {
  test('find previous l', () => {
    var env = setup('hello world', 7);
    pressFindChar(env.app, KEY.F, true, 'l');
    expect(getCursor(env)).toBe(3);
  });
});

describe('t{char} - till forward', () => {
  test('stop one before target', () => {
    var env = setup('hello world', 0);
    pressFindChar(env.app, KEY.T, false, 'o');
    expect(getCursor(env)).toBe(3);
  });
});

describe('T{char} - till backward', () => {
  test('stop one after target', () => {
    var env = setup('hello world', 7);
    pressFindChar(env.app, KEY.T, true, 'l');
    expect(getCursor(env)).toBe(4);
  });
});

describe('; - repeat last find forward', () => {
  test('repeats f search', () => {
    var env = setup('abacada', 0);
    pressFindChar(env.app, KEY.F, false, 'a');
    // After f+a from 0, cursor should be at 2 (next 'a')
    expect(getCursor(env)).toBe(2);
    pressKey(env.app, KEY.SEMICOLON);
    // Next 'a' is at 4
    expect(getCursor(env)).toBe(4);
  });
});

describe(', - repeat last find backward', () => {
  test('repeats f search in reverse', () => {
    var env = setup('abacada', 4);
    pressFindChar(env.app, KEY.F, false, 'a');
    // f+a forward from 4 should find 'a' at 6
    expect(getCursor(env)).toBe(6);
    pressKey(env.app, KEY.COMMA);
    // , reverses: backward 'a' from 6 is at 4
    expect(getCursor(env)).toBe(4);
  });
});

describe('( - previous sentence', () => {
  test('moves to start of previous sentence', () => {
    var env = setup(prose, 50);
    pressKey(env.app, KEY.NINE, { shift: true });
    var pos = getCursor(env);
    // Should have moved backward
    expect(pos).toBeLessThan(50);
  });
});

describe(') - next sentence', () => {
  test('moves to start of next sentence', () => {
    var env = setup(prose, 0);
    pressKey(env.app, KEY.ZERO, { shift: true });
    var pos = getCursor(env);
    // Should have moved forward past first sentence
    expect(pos).toBeGreaterThan(0);
  });
});

describe('{ - previous paragraph', () => {
  test('moves to previous paragraph boundary', () => {
    var env = setup(prose, 90);
    pressKey(env.app, KEY.LBRACKET, { shift: true });
    var pos = getCursor(env);
    expect(pos).toBeLessThan(90);
  });
});

describe('} - next paragraph', () => {
  test('moves to next paragraph boundary', () => {
    var env = setup(prose, 0);
    pressKey(env.app, KEY.RBRACKET, { shift: true });
    var pos = getCursor(env);
    expect(pos).toBeGreaterThan(0);
  });
});
