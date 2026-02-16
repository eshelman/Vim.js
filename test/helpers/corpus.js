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

export const allCorpora = {
  prose,
  code,
  cjk,
  singleLine,
  emptyLines,
  oneChar,
  symbols,
  whitespace,
};
