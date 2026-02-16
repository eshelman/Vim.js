import { describe, test, expect } from 'vitest';
import { setup, pressKey, pressNumber, KEY } from './helpers/setup.js';
import { prose, code, singleLine, longLine } from './helpers/corpus.js';

function getCursor(env) {
  return env.el.selectionStart;
}

/**
 * Helper: execute a programmatic search through the controller.
 * direction: 1 = forward, -1 = backward
 */
function executeSearch(app, query, direction) {
  app.controller.executeSearch(query, direction || 1);
}

// Key codes
var SLASH = 191;    // / key
var N_KEY = 78;     // n key
var EIGHT = 56;     // 8 key (shift = *)
var THREE = 51;     // 3 key (shift = #)

// ========================================
// search forward (/)
// ========================================
describe('search forward (/)', () => {
  test('/ key sets searchRequest with forward direction', () => {
    var env = setup('hello world', 0);
    pressKey(env.app, SLASH);
    expect(env.app.searchRequest).toBeTruthy();
    expect(env.app.searchRequest.direction).toBe(1);
  });

  test('finds next occurrence of string after cursor', () => {
    var env = setup('hello world hello', 0);
    executeSearch(env.app, 'hello', 1);
    expect(getCursor(env)).toBe(12);
  });

  test('wraps around to beginning when no match after cursor', () => {
    var env = setup('hello world', 8);
    executeSearch(env.app, 'hello', 1);
    expect(getCursor(env)).toBe(0);
  });

  test('no match leaves cursor unchanged', () => {
    var env = setup('hello world', 3);
    executeSearch(env.app, 'xyz', 1);
    expect(getCursor(env)).toBe(3);
  });

  test('finds from cursor position, not from start of text', () => {
    var env = setup('aaa bbb aaa bbb', 4);
    executeSearch(env.app, 'bbb', 1);
    // Cursor is at 4 (first 'b' of first 'bbb'), next 'bbb' starts at 12
    expect(getCursor(env)).toBe(12);
  });

  test('finds single-character pattern', () => {
    var env = setup('abcabc', 0);
    executeSearch(env.app, 'b', 1);
    expect(getCursor(env)).toBe(1);
  });

  test('stores search state for later n/N', () => {
    var env = setup('foo bar foo', 0);
    executeSearch(env.app, 'foo', 1);
    expect(env.app._searchState).toBeTruthy();
    expect(env.app._searchState.query).toBe('foo');
    expect(env.app._searchState.direction).toBe(1);
  });
});

// ========================================
// search backward (?)
// ========================================
describe('search backward (?)', () => {
  test('? key sets searchRequest with backward direction', () => {
    var env = setup('hello world', 0);
    pressKey(env.app, SLASH, { shift: true });
    expect(env.app.searchRequest).toBeTruthy();
    expect(env.app.searchRequest.direction).toBe(-1);
  });

  test('finds previous occurrence of string before cursor', () => {
    // Cursor at 14 is inside 'hello' at pos 12. lastIndexOf('hello', 13) = 12.
    var env = setup('hello world hello', 14);
    executeSearch(env.app, 'hello', -1);
    expect(getCursor(env)).toBe(12);
  });

  test('wraps around to end when no match before cursor', () => {
    var env = setup('world hello', 2);
    executeSearch(env.app, 'hello', -1);
    expect(getCursor(env)).toBe(6);
  });

  test('no match leaves cursor unchanged', () => {
    var env = setup('hello world', 5);
    executeSearch(env.app, 'xyz', -1);
    expect(getCursor(env)).toBe(5);
  });

  test('finds from cursor position backward, not from end', () => {
    var env = setup('aaa bbb aaa bbb', 10);
    executeSearch(env.app, 'aaa', -1);
    // Cursor is at 10 (inside second 'aaa' at pos 8-10), previous 'aaa' before pos 10 is at pos 8
    // Actually 'aaa' at 0 and 'aaa' at 8. lastIndexOf('aaa', 9) = 8
    expect(getCursor(env)).toBe(8);
  });

  test('stores search state for backward direction', () => {
    var env = setup('foo bar foo', 8);
    executeSearch(env.app, 'foo', -1);
    expect(env.app._searchState.query).toBe('foo');
    expect(env.app._searchState.direction).toBe(-1);
  });
});

// ========================================
// n - next match
// ========================================
describe('n - next match', () => {
  test('repeats forward search', () => {
    var env = setup('abc abc abc', 0);
    executeSearch(env.app, 'abc', 1);
    expect(getCursor(env)).toBe(4);
    // Press n to find next
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(8);
  });

  test('repeats backward search in same direction', () => {
    var env = setup('abc abc abc', 10);
    executeSearch(env.app, 'abc', -1);
    expect(getCursor(env)).toBe(8);
    // Press n to find next in backward direction
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(4);
  });

  test('wraps around when repeating forward', () => {
    var env = setup('abc abc abc', 0);
    executeSearch(env.app, 'abc', 1);
    expect(getCursor(env)).toBe(4);
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(8);
    pressKey(env.app, N_KEY);
    // Should wrap around to 0
    expect(getCursor(env)).toBe(0);
  });

  test('works with count prefix (3n)', () => {
    var env = setup('ab ab ab ab ab', 0);
    executeSearch(env.app, 'ab', 1);
    expect(getCursor(env)).toBe(3);
    // Press 3n to skip 3 more matches
    pressNumber(env.app, 3);
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(12);
  });

  test('no-op when no previous search', () => {
    var env = setup('hello world', 3);
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(3);
  });
});

// ========================================
// N - previous match (reverse)
// ========================================
describe('N - previous match (reverse)', () => {
  test('reverses forward search direction', () => {
    var env = setup('abc abc abc', 0);
    executeSearch(env.app, 'abc', 1);
    expect(getCursor(env)).toBe(4);
    // Press N (shift+n) to search in reverse direction
    pressKey(env.app, N_KEY, { shift: true });
    expect(getCursor(env)).toBe(0);
  });

  test('reverses backward search direction', () => {
    var env = setup('abc abc abc', 8);
    executeSearch(env.app, 'abc', -1);
    expect(getCursor(env)).toBe(4);
    // Press N to reverse: backward search reversed = forward
    pressKey(env.app, N_KEY, { shift: true });
    expect(getCursor(env)).toBe(8);
  });

  test('wraps around when reversing', () => {
    var env = setup('abc abc abc', 0);
    executeSearch(env.app, 'abc', 1);
    expect(getCursor(env)).toBe(4);
    // N reverses, searching backward from 4
    pressKey(env.app, N_KEY, { shift: true });
    expect(getCursor(env)).toBe(0);
    // N again wraps around to end
    pressKey(env.app, N_KEY, { shift: true });
    expect(getCursor(env)).toBe(8);
  });

  test('no-op when no previous search', () => {
    var env = setup('hello world', 5);
    pressKey(env.app, N_KEY, { shift: true });
    expect(getCursor(env)).toBe(5);
  });
});

// ========================================
// * - search word under cursor forward
// ========================================
describe('* - search word under cursor forward', () => {
  test('searches for word under cursor and finds next occurrence', () => {
    var env = setup('hello world hello', 0);
    pressKey(env.app, EIGHT, { shift: true });
    expect(getCursor(env)).toBe(12);
  });

  test('wraps around to first occurrence', () => {
    var env = setup('hello world hello', 12);
    pressKey(env.app, EIGHT, { shift: true });
    expect(getCursor(env)).toBe(0);
  });

  test('sets search state for subsequent n/N', () => {
    var env = setup('foo bar foo baz foo', 0);
    pressKey(env.app, EIGHT, { shift: true });
    expect(getCursor(env)).toBe(8);
    expect(env.app._searchState.query).toBe('foo');
    expect(env.app._searchState.direction).toBe(1);
    // n should find next
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(16);
  });

  test('no-op when cursor is on whitespace', () => {
    var env = setup('hello world', 5);
    pressKey(env.app, EIGHT, { shift: true });
    // cursor should not move - on space character
    expect(getCursor(env)).toBe(5);
  });

  test('no-op when cursor is on symbol', () => {
    var env = setup('a.b(c)', 1);
    pressKey(env.app, EIGHT, { shift: true });
    // cursor is on '.', should not move
    expect(getCursor(env)).toBe(1);
  });

  test('finds word when cursor is in middle of word', () => {
    var env = setup('hello world hello', 2);
    // Cursor is on 'l' in first 'hello'
    pressKey(env.app, EIGHT, { shift: true });
    expect(getCursor(env)).toBe(12);
  });
});

// ========================================
// # - search word under cursor backward
// ========================================
describe('# - search word under cursor backward', () => {
  test('searches backward for word under cursor', () => {
    var env = setup('hello world hello', 12);
    pressKey(env.app, THREE, { shift: true });
    expect(getCursor(env)).toBe(0);
  });

  test('wraps around to last occurrence', () => {
    var env = setup('hello world hello', 0);
    pressKey(env.app, THREE, { shift: true });
    expect(getCursor(env)).toBe(12);
  });

  test('sets search state for subsequent n/N', () => {
    var env = setup('foo bar foo baz foo', 16);
    pressKey(env.app, THREE, { shift: true });
    expect(getCursor(env)).toBe(8);
    expect(env.app._searchState.query).toBe('foo');
    expect(env.app._searchState.direction).toBe(-1);
    // n repeats in backward direction
    pressKey(env.app, N_KEY);
    expect(getCursor(env)).toBe(0);
  });

  test('no-op when cursor is on whitespace', () => {
    var env = setup('hello world', 5);
    pressKey(env.app, THREE, { shift: true });
    expect(getCursor(env)).toBe(5);
  });
});

// ========================================
// TextUtil: findNext / findPrev
// ========================================
describe('textUtil.findNext', () => {
  test('finds next occurrence after position', () => {
    var env = setup('hello world hello', 0);
    var pos = env.textUtil.findNext('hello', 0);
    expect(pos).toBe(12);
  });

  test('wraps around when no match after position', () => {
    var env = setup('hello world', 6);
    var pos = env.textUtil.findNext('hello', 6);
    expect(pos).toBe(0);
  });

  test('returns undefined when no match at all', () => {
    var env = setup('hello world', 0);
    var pos = env.textUtil.findNext('xyz', 0);
    expect(pos).toBeUndefined();
  });

  test('finds match at position 0 during wrap', () => {
    var env = setup('abc def', 4);
    var pos = env.textUtil.findNext('abc', 4);
    expect(pos).toBe(0);
  });
});

describe('textUtil.findPrev', () => {
  test('finds previous occurrence before position', () => {
    var env = setup('hello world hello', 14);
    var pos = env.textUtil.findPrev('hello', 14);
    expect(pos).toBe(12);
  });

  test('wraps around when no match before position', () => {
    var env = setup('world hello', 2);
    var pos = env.textUtil.findPrev('hello', 2);
    expect(pos).toBe(6);
  });

  test('returns undefined when no match at all', () => {
    var env = setup('hello world', 5);
    var pos = env.textUtil.findPrev('xyz', 5);
    expect(pos).toBeUndefined();
  });
});

describe('textUtil.getWordUnderCursor', () => {
  test('returns word when cursor is at start of word', () => {
    var env = setup('hello world', 0);
    expect(env.textUtil.getWordUnderCursor(0)).toBe('hello');
  });

  test('returns word when cursor is in middle of word', () => {
    var env = setup('hello world', 2);
    expect(env.textUtil.getWordUnderCursor(2)).toBe('hello');
  });

  test('returns word when cursor is at end of word', () => {
    var env = setup('hello world', 4);
    expect(env.textUtil.getWordUnderCursor(4)).toBe('hello');
  });

  test('returns undefined when cursor is on whitespace', () => {
    var env = setup('hello world', 5);
    expect(env.textUtil.getWordUnderCursor(5)).toBeUndefined();
  });

  test('returns undefined when cursor is on symbol', () => {
    var env = setup('a.b', 1);
    expect(env.textUtil.getWordUnderCursor(1)).toBeUndefined();
  });

  test('returns word containing underscore', () => {
    var env = setup('hello_world foo', 3);
    expect(env.textUtil.getWordUnderCursor(3)).toBe('hello_world');
  });

  test('returns word containing digits', () => {
    var env = setup('var item42 = true', 5);
    expect(env.textUtil.getWordUnderCursor(5)).toBe('item42');
  });

  test('returns undefined for empty text', () => {
    var env = setup('', 0);
    expect(env.textUtil.getWordUnderCursor(0)).toBeUndefined();
  });
});

// ========================================
// search edge cases
// ========================================
describe('search edge cases', () => {
  test('search in single-line text', () => {
    var env = setup('abcdefghij', 0);
    executeSearch(env.app, 'def', 1);
    expect(getCursor(env)).toBe(3);
  });

  test('search in empty text', () => {
    var env = setup(' ', 0);
    executeSearch(env.app, 'hello', 1);
    expect(getCursor(env)).toBe(0);
  });

  test('search for string at position 0', () => {
    var env = setup('hello world', 6);
    executeSearch(env.app, 'hello', 1);
    expect(getCursor(env)).toBe(0);
  });

  test('search for string at end of text', () => {
    var env = setup('start middle end', 0);
    executeSearch(env.app, 'end', 1);
    expect(getCursor(env)).toBe(13);
  });

  test('search for multi-word string', () => {
    var env = setup('the quick brown fox jumps over the lazy dog', 0);
    executeSearch(env.app, 'brown fox', 1);
    expect(getCursor(env)).toBe(10);
  });

  test('search is case-sensitive', () => {
    var env = setup('Hello hello HELLO', 0);
    executeSearch(env.app, 'hello', 1);
    expect(getCursor(env)).toBe(6);
  });

  test('search across newlines', () => {
    var env = setup('line one\nline two\nline three', 0);
    executeSearch(env.app, 'line two', 1);
    expect(getCursor(env)).toBe(9);
  });

  test('backward search across newlines', () => {
    var env = setup('line one\nline two\nline three', 20);
    executeSearch(env.app, 'line one', -1);
    expect(getCursor(env)).toBe(0);
  });

  test('n after * continues searching for same word', () => {
    var env = setup('foo bar foo baz foo', 0);
    pressKey(env.app, EIGHT, { shift: true }); // *
    expect(getCursor(env)).toBe(8);
    pressKey(env.app, N_KEY); // n
    expect(getCursor(env)).toBe(16);
    pressKey(env.app, N_KEY); // n wraps
    expect(getCursor(env)).toBe(0);
  });

  test('N after # continues searching in reverse', () => {
    var env = setup('foo bar foo baz foo', 16);
    pressKey(env.app, THREE, { shift: true }); // #
    expect(getCursor(env)).toBe(8);
    // N reverses # direction: since # is backward, N goes forward
    pressKey(env.app, N_KEY, { shift: true }); // N
    expect(getCursor(env)).toBe(16);
  });

  test('search with prose corpus', () => {
    var env = setup(prose, 0);
    executeSearch(env.app, 'the', 1);
    // 'the' first appears in 'the lazy dog' - find it
    var idx = prose.indexOf('the', 1);
    expect(getCursor(env)).toBe(idx);
  });

  test('search in code corpus', () => {
    var env = setup(code, 0);
    executeSearch(env.app, 'msg', 1);
    var idx = code.indexOf('msg', 1);
    expect(getCursor(env)).toBe(idx);
  });
});
