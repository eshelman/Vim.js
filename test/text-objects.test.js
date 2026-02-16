import { describe, test, expect } from 'vitest';
import { setup, pressCompoundKey, pressKey, KEY } from './helpers/setup.js';

function getCursor(env) {
  return env.el.selectionStart;
}
function getText(env) {
  return env.el.value;
}

/**
 * Helper to simulate the 3-key text object sequence: operator + i/a + specifier.
 * Since text objects are 3-key sequences (e.g., d + i + w), we press the compound
 * key (operator + i/a) which sets vim.textObjectRequest, then resolve the request
 * by calling controller.executeTextObject with the specifier character.
 */
function pressTextObject(app, operatorCode, typeCode, specifierChar) {
  // Press operator + i/a as compound key
  pressCompoundKey(app, operatorCode, typeCode);
  // Then handle the text object request
  var req = app.vim.textObjectRequest;
  if (req) {
    app.vim.textObjectRequest = null;
    app.controller.executeTextObject(specifierChar, req);
  }
}

// ============================================================
// diw — delete inner word
// ============================================================
describe('diw - delete inner word', () => {
  test('middle of word deletes the word', () => {
    var env = setup('hello world', 7);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe('hello ');
  });

  test('start of word deletes entire word', () => {
    var env = setup('hello world', 6);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe('hello ');
  });

  test('end of word deletes entire word', () => {
    var env = setup('hello world', 10);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe('hello ');
  });

  test('first word in text', () => {
    var env = setup('hello world', 2);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe(' world');
  });

  test('single word text', () => {
    var env = setup('hello', 2);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    // textUtil.delete replaces empty text with ' '
    expect(getText(env)).toBe(' ');
  });

  test('cursor on whitespace deletes whitespace', () => {
    var env = setup('hello   world', 6);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe('helloworld');
  });

  test('word with underscores treated as single word', () => {
    var env = setup('foo_bar baz', 2);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe(' baz');
  });

  test('cursor on symbol word deletes symbols only', () => {
    var env = setup('foo == bar', 4);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe('foo  bar');
  });
});

// ============================================================
// daw — delete a word (word + surrounding whitespace)
// ============================================================
describe('daw - delete a word', () => {
  test('middle word with trailing space', () => {
    var env = setup('hello world foo', 7);
    pressTextObject(env.app, KEY.D, KEY.A, 'w');
    expect(getText(env)).toBe('hello foo');
  });

  test('first word deletes word and trailing space', () => {
    var env = setup('hello world', 2);
    pressTextObject(env.app, KEY.D, KEY.A, 'w');
    expect(getText(env)).toBe('world');
  });

  test('last word deletes leading space and word', () => {
    var env = setup('hello world', 7);
    pressTextObject(env.app, KEY.D, KEY.A, 'w');
    expect(getText(env)).toBe('hello');
  });

  test('single word text', () => {
    var env = setup('hello', 2);
    pressTextObject(env.app, KEY.D, KEY.A, 'w');
    expect(getText(env)).toBe(' ');
  });

  test('word at start of line', () => {
    var env = setup('hello world', 0);
    pressTextObject(env.app, KEY.D, KEY.A, 'w');
    expect(getText(env)).toBe('world');
  });
});

// ============================================================
// ciw — change inner word (delete + enter edit mode)
// ============================================================
describe('ciw - change inner word', () => {
  test('deletes word and positions cursor', () => {
    var env = setup('hello world', 7);
    pressTextObject(env.app, KEY.C, KEY.I, 'w');
    expect(getText(env)).toBe('hello ');
    expect(getCursor(env)).toBe(6);
  });

  test('first word', () => {
    var env = setup('hello world', 2);
    pressTextObject(env.app, KEY.C, KEY.I, 'w');
    expect(getText(env)).toBe(' world');
    expect(getCursor(env)).toBe(0);
  });
});

// ============================================================
// caw — change a word
// ============================================================
describe('caw - change a word', () => {
  test('deletes word with space and positions cursor', () => {
    var env = setup('hello world foo', 7);
    pressTextObject(env.app, KEY.C, KEY.A, 'w');
    expect(getText(env)).toBe('hello foo');
    expect(getCursor(env)).toBe(6);
  });

  test('last word deletes leading space', () => {
    var env = setup('hello world', 7);
    pressTextObject(env.app, KEY.C, KEY.A, 'w');
    expect(getText(env)).toBe('hello');
    expect(getCursor(env)).toBe(5);
  });
});

// ============================================================
// yiw — yank inner word
// ============================================================
describe('yiw - yank inner word', () => {
  test('yanks the word to clipboard', () => {
    var env = setup('hello world', 7);
    pressTextObject(env.app, KEY.Y, KEY.I, 'w');
    expect(env.app.clipboard).toBe('world');
    // text unchanged
    expect(getText(env)).toBe('hello world');
  });

  test('yanks first word', () => {
    var env = setup('hello world', 2);
    pressTextObject(env.app, KEY.Y, KEY.I, 'w');
    expect(env.app.clipboard).toBe('hello');
  });

  test('cursor on whitespace yanks whitespace', () => {
    var env = setup('hello   world', 6);
    pressTextObject(env.app, KEY.Y, KEY.I, 'w');
    expect(env.app.clipboard).toBe('   ');
  });
});

// ============================================================
// yaw — yank a word
// ============================================================
describe('yaw - yank a word', () => {
  test('yanks word and trailing space', () => {
    var env = setup('hello world', 2);
    pressTextObject(env.app, KEY.Y, KEY.A, 'w');
    expect(env.app.clipboard).toBe('hello ');
    expect(getText(env)).toBe('hello world');
  });

  test('yanks last word with leading space', () => {
    var env = setup('hello world', 7);
    pressTextObject(env.app, KEY.Y, KEY.A, 'w');
    expect(env.app.clipboard).toBe(' world');
  });
});

// ============================================================
// di" — delete inner double-quote
// ============================================================
describe('di" - delete inner double-quote', () => {
  test('deletes content between quotes', () => {
    var env = setup('say "hello" world', 6);
    pressTextObject(env.app, KEY.D, KEY.I, '"');
    expect(getText(env)).toBe('say "" world');
  });

  test('cursor on opening quote', () => {
    var env = setup('say "hello" world', 4);
    pressTextObject(env.app, KEY.D, KEY.I, '"');
    expect(getText(env)).toBe('say "" world');
  });

  test('cursor on closing quote', () => {
    var env = setup('say "hello" world', 10);
    pressTextObject(env.app, KEY.D, KEY.I, '"');
    expect(getText(env)).toBe('say "" world');
  });

  test('no surrounding quotes - no-op', () => {
    var env = setup('hello world', 3);
    pressTextObject(env.app, KEY.D, KEY.I, '"');
    expect(getText(env)).toBe('hello world');
  });

  test('empty quotes', () => {
    var env = setup('say "" world', 4);
    pressTextObject(env.app, KEY.D, KEY.I, '"');
    // already empty between quotes, no-op
    expect(getText(env)).toBe('say "" world');
  });
});

// ============================================================
// da" — delete a double-quote (including quotes)
// ============================================================
describe('da" - delete a double-quote', () => {
  test('deletes quotes and content', () => {
    var env = setup('say "hello" world', 6);
    pressTextObject(env.app, KEY.D, KEY.A, '"');
    expect(getText(env)).toBe('say  world');
  });

  test('cursor on opening quote', () => {
    var env = setup('say "hello" world', 4);
    pressTextObject(env.app, KEY.D, KEY.A, '"');
    expect(getText(env)).toBe('say  world');
  });
});

// ============================================================
// ci" — change inner double-quote
// ============================================================
describe('ci" - change inner double-quote', () => {
  test('deletes content between quotes and positions cursor', () => {
    var env = setup('say "hello" world', 6);
    pressTextObject(env.app, KEY.C, KEY.I, '"');
    expect(getText(env)).toBe('say "" world');
    expect(getCursor(env)).toBe(5);
  });
});

// ============================================================
// yi" — yank inner double-quote
// ============================================================
describe('yi" - yank inner double-quote', () => {
  test('yanks content between quotes', () => {
    var env = setup('say "hello" world', 6);
    pressTextObject(env.app, KEY.Y, KEY.I, '"');
    expect(env.app.clipboard).toBe('hello');
    expect(getText(env)).toBe('say "hello" world');
  });
});

// ============================================================
// di' — delete inner single-quote
// ============================================================
describe("di' - delete inner single-quote", () => {
  test('deletes content between single quotes', () => {
    var env = setup("say 'hello' world", 6);
    pressTextObject(env.app, KEY.D, KEY.I, "'");
    expect(getText(env)).toBe("say '' world");
  });
});

// ============================================================
// da' — delete a single-quote
// ============================================================
describe("da' - delete a single-quote", () => {
  test('deletes quotes and content', () => {
    var env = setup("say 'hello' world", 6);
    pressTextObject(env.app, KEY.D, KEY.A, "'");
    expect(getText(env)).toBe('say  world');
  });
});

// ============================================================
// di( / di) — delete inner parens
// ============================================================
describe('di( - delete inner parens', () => {
  test('deletes content between parens', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.D, KEY.I, '(');
    expect(getText(env)).toBe('foo()end');
  });

  test('di) is same as di(', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.D, KEY.I, ')');
    expect(getText(env)).toBe('foo()end');
  });

  test('nested parens - inner pair', () => {
    var env = setup('(a (b) c)', 4);
    pressTextObject(env.app, KEY.D, KEY.I, '(');
    expect(getText(env)).toBe('(a () c)');
  });

  test('cursor on opening paren', () => {
    var env = setup('foo(bar)end', 3);
    pressTextObject(env.app, KEY.D, KEY.I, '(');
    expect(getText(env)).toBe('foo()end');
  });

  test('cursor on closing paren', () => {
    var env = setup('foo(bar)end', 7);
    pressTextObject(env.app, KEY.D, KEY.I, '(');
    expect(getText(env)).toBe('foo()end');
  });

  test('no surrounding parens - no-op', () => {
    var env = setup('hello world', 3);
    pressTextObject(env.app, KEY.D, KEY.I, '(');
    expect(getText(env)).toBe('hello world');
  });
});

// ============================================================
// da( / da) — delete a parens (including delimiters)
// ============================================================
describe('da( - delete a parens', () => {
  test('deletes parens and content', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.D, KEY.A, '(');
    expect(getText(env)).toBe('fooend');
  });

  test('da) is same as da(', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.D, KEY.A, ')');
    expect(getText(env)).toBe('fooend');
  });
});

// ============================================================
// ci( — change inner parens
// ============================================================
describe('ci( - change inner parens', () => {
  test('deletes content between parens and positions cursor', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.C, KEY.I, '(');
    expect(getText(env)).toBe('foo()end');
    expect(getCursor(env)).toBe(4);
  });
});

// ============================================================
// yi( — yank inner parens
// ============================================================
describe('yi( - yank inner parens', () => {
  test('yanks content between parens', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.Y, KEY.I, '(');
    expect(env.app.clipboard).toBe('bar baz');
    expect(getText(env)).toBe('foo(bar baz)end');
  });
});

// ============================================================
// di{ / di} — delete inner braces
// ============================================================
describe('di{ - delete inner braces', () => {
  test('deletes content between braces', () => {
    var env = setup('if {x: 1}', 5);
    pressTextObject(env.app, KEY.D, KEY.I, '{');
    expect(getText(env)).toBe('if {}');
  });

  test('di} is same as di{', () => {
    var env = setup('if {x: 1}', 5);
    pressTextObject(env.app, KEY.D, KEY.I, '}');
    expect(getText(env)).toBe('if {}');
  });

  test('nested braces', () => {
    var env = setup('{a {b} c}', 4);
    pressTextObject(env.app, KEY.D, KEY.I, '{');
    expect(getText(env)).toBe('{a {} c}');
  });
});

// ============================================================
// da{ / da} — delete a braces
// ============================================================
describe('da{ - delete a braces', () => {
  test('deletes braces and content', () => {
    var env = setup('if {x: 1} end', 5);
    pressTextObject(env.app, KEY.D, KEY.A, '{');
    expect(getText(env)).toBe('if  end');
  });
});

// ============================================================
// di[ / di] — delete inner brackets
// ============================================================
describe('di[ - delete inner brackets', () => {
  test('deletes content between brackets', () => {
    var env = setup('arr[1, 2, 3]end', 5);
    pressTextObject(env.app, KEY.D, KEY.I, '[');
    expect(getText(env)).toBe('arr[]end');
  });

  test('di] is same as di[', () => {
    var env = setup('arr[1, 2, 3]end', 5);
    pressTextObject(env.app, KEY.D, KEY.I, ']');
    expect(getText(env)).toBe('arr[]end');
  });
});

// ============================================================
// da[ / da] — delete a brackets
// ============================================================
describe('da[ - delete a brackets', () => {
  test('deletes brackets and content', () => {
    var env = setup('arr[1, 2, 3]end', 5);
    pressTextObject(env.app, KEY.D, KEY.A, '[');
    expect(getText(env)).toBe('arrend');
  });
});

// ============================================================
// ci{ — change inner braces
// ============================================================
describe('ci{ - change inner braces', () => {
  test('deletes content between braces and positions cursor', () => {
    var env = setup('if {x: 1} end', 5);
    pressTextObject(env.app, KEY.C, KEY.I, '{');
    expect(getText(env)).toBe('if {} end');
    expect(getCursor(env)).toBe(4);
  });
});

// ============================================================
// yi{ — yank inner braces
// ============================================================
describe('yi{ - yank inner braces', () => {
  test('yanks content between braces', () => {
    var env = setup('if {x: 1} end', 5);
    pressTextObject(env.app, KEY.Y, KEY.I, '{');
    expect(env.app.clipboard).toBe('x: 1');
    expect(getText(env)).toBe('if {x: 1} end');
  });
});

// ============================================================
// ci[ — change inner brackets
// ============================================================
describe('ci[ - change inner brackets', () => {
  test('deletes content and positions cursor', () => {
    var env = setup('arr[1, 2, 3]end', 5);
    pressTextObject(env.app, KEY.C, KEY.I, '[');
    expect(getText(env)).toBe('arr[]end');
    expect(getCursor(env)).toBe(4);
  });
});

// ============================================================
// ya" — yank a double-quote (including quotes)
// ============================================================
describe('ya" - yank a double-quote', () => {
  test('yanks quotes and content', () => {
    var env = setup('say "hello" world', 6);
    pressTextObject(env.app, KEY.Y, KEY.A, '"');
    expect(env.app.clipboard).toBe('"hello"');
    expect(getText(env)).toBe('say "hello" world');
  });
});

// ============================================================
// ya( — yank a parens
// ============================================================
describe('ya( - yank a parens', () => {
  test('yanks parens and content', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.Y, KEY.A, '(');
    expect(env.app.clipboard).toBe('(bar baz)');
    expect(getText(env)).toBe('foo(bar baz)end');
  });
});

// ============================================================
// ca" — change a double-quote
// ============================================================
describe('ca" - change a double-quote', () => {
  test('deletes quotes and content, positions cursor', () => {
    var env = setup('say "hello" world', 6);
    pressTextObject(env.app, KEY.C, KEY.A, '"');
    expect(getText(env)).toBe('say  world');
    expect(getCursor(env)).toBe(4);
  });
});

// ============================================================
// ca( — change a parens
// ============================================================
describe('ca( - change a parens', () => {
  test('deletes parens and content, positions cursor', () => {
    var env = setup('foo(bar baz)end', 5);
    pressTextObject(env.app, KEY.C, KEY.A, '(');
    expect(getText(env)).toBe('fooend');
    expect(getCursor(env)).toBe(3);
  });
});

// ============================================================
// Additional edge cases
// ============================================================
describe('text object edge cases', () => {
  test('diw on single-character word', () => {
    var env = setup('a b c', 2);
    pressTextObject(env.app, KEY.D, KEY.I, 'w');
    expect(getText(env)).toBe('a  c');
  });

  test('daw on single-character word in middle', () => {
    var env = setup('a b c', 2);
    pressTextObject(env.app, KEY.D, KEY.A, 'w');
    expect(getText(env)).toBe('a c');
  });

  test('di" with cursor between quotes on first char', () => {
    var env = setup('"hello"', 1);
    pressTextObject(env.app, KEY.D, KEY.I, '"');
    expect(getText(env)).toBe('""');
  });

  test('da" deletes entire quoted string including quotes', () => {
    var env = setup('"hello"', 3);
    pressTextObject(env.app, KEY.D, KEY.A, '"');
    expect(getText(env)).toBe(' ');
  });

  test('di( with deeply nested parens targets innermost', () => {
    var env = setup('((inner))', 3);
    pressTextObject(env.app, KEY.D, KEY.I, '(');
    expect(getText(env)).toBe('(())');
  });

  test('multiline di{ deletes content across lines', () => {
    var env = setup('if {\n  x = 1;\n}', 6);
    pressTextObject(env.app, KEY.D, KEY.I, '{');
    expect(getText(env)).toBe('if {}');
  });

  test('yiw does not change text', () => {
    var env = setup('hello world', 0);
    pressTextObject(env.app, KEY.Y, KEY.I, 'w');
    expect(getText(env)).toBe('hello world');
    expect(env.app.clipboard).toBe('hello');
  });

  test('yaw does not change text', () => {
    var env = setup('hello world', 0);
    pressTextObject(env.app, KEY.Y, KEY.A, 'w');
    expect(getText(env)).toBe('hello world');
    expect(env.app.clipboard).toBe('hello ');
  });
});
