import { describe, test, expect } from 'vitest';
import { setup, pressKey, pressCompoundKey, KEY } from './helpers/setup.js';
import { allCorpora } from './helpers/corpus.js';

/**
 * For each corpus, compute interesting boundary positions:
 * - 0 (start of text)
 * - 1 (one past start, if text length > 1)
 * - last character position
 * - start of each line
 * - end of each line
 * - empty line positions (where a line has length 0)
 */
function getBoundaryPositions(text) {
  var positions = new Set();
  positions.add(0);
  if (text.length > 1) {
    positions.add(1);
  }
  if (text.length > 0) {
    positions.add(text.length - 1);
  }

  var lineStart = 0;
  for (var i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      // End of current line
      if (i > 0) positions.add(i - 1);
      positions.add(i);
      // Start of next line
      if (i + 1 < text.length) {
        positions.add(i + 1);
        // If the next char is also \n, this is an empty line
        if (text[i + 1] === '\n') {
          positions.add(i + 1);
        }
      }
      lineStart = i + 1;
    }
  }

  return Array.from(positions).filter(function (p) { return p >= 0 && p < text.length; }).sort(function (a, b) { return a - b; });
}

// Simple motions to test (no special args needed)
var simpleMotions = [
  { name: 'h', code: KEY.H, shift: false },
  { name: 'l', code: KEY.L, shift: false },
  { name: 'j', code: KEY.J, shift: false },
  { name: 'k', code: KEY.K, shift: false },
  { name: 'w', code: KEY.W, shift: false },
  { name: 'b', code: KEY.B, shift: false },
  { name: 'e', code: KEY.E, shift: false },
  { name: 'E', code: KEY.E, shift: true },
  { name: 'B', code: KEY.B, shift: true },
  { name: '0', code: KEY.ZERO, shift: false },
  { name: '$', code: KEY.FOUR, shift: true },
];

// Compound motions
var compoundMotions = [
  { name: 'gg', code1: KEY.G, code2: KEY.G },
];

describe('boundary: simple motions never crash or go out of bounds', () => {
  var testCases = [];
  for (var corpusName in allCorpora) {
    var text = allCorpora[corpusName];
    var positions = getBoundaryPositions(text);
    for (var mi = 0; mi < simpleMotions.length; mi++) {
      var motion = simpleMotions[mi];
      for (var pi = 0; pi < positions.length; pi++) {
        testCases.push({
          desc: motion.name + ' on "' + corpusName + '" at pos ' + positions[pi],
          text: text,
          cursor: positions[pi],
          motion: motion,
        });
      }
    }
  }

  test.each(testCases)('$desc', ({ text, cursor, motion }) => {
    var env = setup(text, cursor);
    pressKey(env.app, motion.code, { shift: motion.shift });
    var newCursor = env.el.selectionStart;
    // Cursor must be within valid bounds
    expect(newCursor).toBeGreaterThanOrEqual(0);
    expect(newCursor).toBeLessThanOrEqual(env.el.value.length);
    // j/k may insert space placeholders on empty lines (by design),
    // so only assert text unchanged for other motions
    if (motion.name !== 'j' && motion.name !== 'k') {
      expect(env.el.value).toBe(text);
    }
  });
});

describe('boundary: compound motions never crash', () => {
  var testCases = [];
  for (var corpusName in allCorpora) {
    var text = allCorpora[corpusName];
    var positions = getBoundaryPositions(text);
    for (var mi = 0; mi < compoundMotions.length; mi++) {
      var motion = compoundMotions[mi];
      for (var pi = 0; pi < positions.length; pi++) {
        testCases.push({
          desc: motion.name + ' on "' + corpusName + '" at pos ' + positions[pi],
          text: text,
          cursor: positions[pi],
          motion: motion,
        });
      }
    }
  }

  test.each(testCases)('$desc', ({ text, cursor, motion }) => {
    var env = setup(text, cursor);
    pressCompoundKey(env.app, motion.code1, motion.code2);
    var newCursor = env.el.selectionStart;
    expect(newCursor).toBeGreaterThanOrEqual(0);
    expect(newCursor).toBeLessThanOrEqual(text.length);
    expect(env.el.value).toBe(text);
  });
});

describe('boundary: G motion never crashes', () => {
  var testCases = [];
  for (var corpusName in allCorpora) {
    var text = allCorpora[corpusName];
    var positions = getBoundaryPositions(text);
    for (var pi = 0; pi < positions.length; pi++) {
      testCases.push({
        desc: 'G on "' + corpusName + '" at pos ' + positions[pi],
        text: text,
        cursor: positions[pi],
      });
    }
  }

  test.each(testCases)('$desc', ({ text, cursor }) => {
    var env = setup(text, cursor);
    pressKey(env.app, KEY.G, { shift: true });
    var newCursor = env.el.selectionStart;
    expect(newCursor).toBeGreaterThanOrEqual(0);
    expect(newCursor).toBeLessThanOrEqual(text.length);
    expect(env.el.value).toBe(text);
  });
});

describe('boundary: sentence/paragraph motions never crash', () => {
  var sentenceMotions = [
    { name: '(', code: KEY.NINE, shift: true },
    { name: ')', code: KEY.ZERO, shift: true },
    { name: '{', code: KEY.LBRACKET, shift: true },
    { name: '}', code: KEY.RBRACKET, shift: true },
  ];

  var testCases = [];
  for (var corpusName in allCorpora) {
    var text = allCorpora[corpusName];
    var positions = getBoundaryPositions(text);
    for (var mi = 0; mi < sentenceMotions.length; mi++) {
      var motion = sentenceMotions[mi];
      for (var pi = 0; pi < positions.length; pi++) {
        testCases.push({
          desc: motion.name + ' on "' + corpusName + '" at pos ' + positions[pi],
          text: text,
          cursor: positions[pi],
          motion: motion,
        });
      }
    }
  }

  test.each(testCases)('$desc', ({ text, cursor, motion }) => {
    var env = setup(text, cursor);
    pressKey(env.app, motion.code, { shift: motion.shift });
    var newCursor = env.el.selectionStart;
    expect(newCursor).toBeGreaterThanOrEqual(0);
    expect(newCursor).toBeLessThanOrEqual(text.length);
    expect(env.el.value).toBe(text);
  });
});

describe('boundary: operators on edge positions do not crash', () => {
  var testCases = [];
  for (var corpusName in allCorpora) {
    var text = allCorpora[corpusName];
    // Test x and dd at start, end, and middle
    var positions = [0];
    if (text.length > 1) positions.push(Math.floor(text.length / 2));
    if (text.length > 0) positions.push(text.length - 1);

    for (var pi = 0; pi < positions.length; pi++) {
      testCases.push({
        desc: 'x on "' + corpusName + '" at pos ' + positions[pi],
        text: text,
        cursor: positions[pi],
        op: 'x',
      });
      testCases.push({
        desc: 'dd on "' + corpusName + '" at pos ' + positions[pi],
        text: text,
        cursor: positions[pi],
        op: 'dd',
      });
    }
  }

  test.each(testCases)('$desc', ({ text, cursor, op }) => {
    var env = setup(text, cursor);
    if (op === 'x') {
      pressKey(env.app, KEY.X);
    } else if (op === 'dd') {
      pressCompoundKey(env.app, KEY.D, KEY.D);
    }
    var newCursor = env.el.selectionStart;
    expect(newCursor).toBeGreaterThanOrEqual(0);
    expect(newCursor).toBeLessThanOrEqual(env.el.value.length);
  });
});
