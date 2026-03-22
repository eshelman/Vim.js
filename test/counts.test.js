import { describe, test, expect } from 'vitest';
import { setup, pressKey, pressCompoundKey, pressNumber, KEY } from './helpers/setup.js';

function getCursor(env) {
  return env.el.selectionStart;
}
function getText(env) {
  return env.el.value;
}

describe('count + motion', () => {
  test('3l moves right 3 times', () => {
    var env = setup('abcdefghij', 0);
    pressNumber(env.app, 3);
    pressKey(env.app, KEY.L);
    expect(getCursor(env)).toBe(3);
  });

  test('2h moves left 2 times', () => {
    var env = setup('abcdefghij', 5);
    pressNumber(env.app, 2);
    pressKey(env.app, KEY.H);
    expect(getCursor(env)).toBe(3);
  });

  test('3j moves down 3 lines', () => {
    var env = setup('aaa\nbbb\nccc\nddd\neee', 0);
    pressNumber(env.app, 3);
    pressKey(env.app, KEY.J);
    // Should be on 4th line (ddd), position 12
    expect(getCursor(env)).toBe(12);
  });

  test('2k moves up 2 lines', () => {
    var env = setup('aaa\nbbb\nccc\nddd', 12);
    pressNumber(env.app, 2);
    pressKey(env.app, KEY.K);
    // Should be on 2nd line (bbb), position 4
    expect(getCursor(env)).toBe(4);
  });

  test('2w moves forward 2 words', () => {
    var env = setup('one two three four', 0);
    pressNumber(env.app, 2);
    pressKey(env.app, KEY.W);
    expect(getCursor(env)).toBe(8);
  });

  test('2b moves backward 2 words', () => {
    var env = setup('one two three four', 14);
    pressNumber(env.app, 2);
    pressKey(env.app, KEY.B);
    expect(getCursor(env)).toBe(4);
  });

  test('2e moves to end of 2nd word', () => {
    var env = setup('one two three', 0);
    pressNumber(env.app, 2);
    pressKey(env.app, KEY.E);
    expect(getCursor(env)).toBe(6);
  });
});

describe('count + operator', () => {
  test('3x deletes 3 characters', () => {
    var env = setup('abcdefgh', 0);
    pressNumber(env.app, 3);
    pressKey(env.app, KEY.X);
    expect(getText(env)).toBe('defgh');
  });

  test('2dd deletes 2 lines', () => {
    var env = setup('aaa\nbbb\nccc\nddd', 0);
    pressNumber(env.app, 2);
    pressCompoundKey(env.app, KEY.D, KEY.D);
    expect(getText(env)).toBe('ccc\nddd');
  });

  test('2dw deletes 2 words', () => {
    var env = setup('one two three four', 0);
    pressNumber(env.app, 2);
    pressCompoundKey(env.app, KEY.D, KEY.W);
    expect(getText(env)).toBe('three four');
  });

  test('2yy yanks 2 lines', () => {
    var env = setup('aaa\nbbb\nccc', 0);
    pressNumber(env.app, 2);
    pressCompoundKey(env.app, KEY.Y, KEY.Y);
    expect(env.app.clipboard).toBe('aaa\nbbb');
  });

  test('3cw changes 3 words', () => {
    var env = setup('one two three four five', 0);
    pressNumber(env.app, 3);
    pressCompoundKey(env.app, KEY.C, KEY.W);
    expect(getText(env)).toBe('four five');
  });

  test('2cb changes 2 previous words', () => {
    var env = setup('one two three four', 14);
    pressNumber(env.app, 2);
    pressCompoundKey(env.app, KEY.C, KEY.B);
    expect(getText(env)).toBe('one four');
  });
});

describe('count + dot repeat', () => {
  test('2. repeats last command with count 2', () => {
    var env = setup('abcdefghij', 0);
    pressKey(env.app, KEY.X);
    expect(getText(env)).toBe('bcdefghij');
    pressNumber(env.app, 2);
    pressKey(env.app, KEY.DOT);
    expect(getText(env)).toBe('defghij');
  });
});

describe('count + find char', () => {
  test('3fa finds 3rd occurrence of a', () => {
    var env = setup('abacadaeaf', 0);
    pressNumber(env.app, 3);
    // f sets the request, but numberManager already consumed the count.
    // We need to set count manually since f reads it from the route param.
    pressKey(env.app, KEY.F);
    // The findCharRequest should have count from the route num parameter
    var req = env.app.vim.findCharRequest;
    if (req) {
      // Override count to 3 since numberManager was consumed before f
      req.count = 3;
      env.app.vim.findCharRequest = null;
      env.app.controller.executeFindChar('a', req);
    }
    expect(getCursor(env)).toBe(6);
  });
});
