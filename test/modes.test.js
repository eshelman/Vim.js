import { describe, test, expect } from 'vitest';
import { setup, pressKey, KEY } from './helpers/setup.js';

function getMode(env) {
  return env.vim.currentMode;
}
function getCursor(env) {
  return env.el.selectionStart;
}

describe('i - enter insert mode', () => {
  test('cursor stays at current position', () => {
    var env = setup('hello', 2);
    pressKey(env.app, KEY.I);
    expect(getCursor(env)).toBe(2);
    // Mode switches to edit after setTimeout; here we verify the insert() call ran
    expect(env.el.selectionStart).toBe(env.el.selectionEnd);
  });
});

describe('I - insert at line head', () => {
  test('moves to line start then enters insert', () => {
    var env = setup('  hello', 4);
    pressKey(env.app, KEY.I, { shift: true });
    expect(getCursor(env)).toBe(0);
  });
});

describe('a - append after cursor', () => {
  test('moves cursor one right', () => {
    var env = setup('hello', 2);
    pressKey(env.app, KEY.A);
    expect(getCursor(env)).toBe(3);
  });
});

describe('A - append at line tail', () => {
  test('moves to end of line then appends', () => {
    var env = setup('hello\nworld', 1);
    pressKey(env.app, KEY.A, { shift: true });
    // Should be at end of first line, in append position
    var pos = getCursor(env);
    expect(pos).toBeGreaterThanOrEqual(4);
  });
});

describe('o - open line below', () => {
  test('creates new line below and enters insert', () => {
    var env = setup('abc\ndef', 1);
    pressKey(env.app, KEY.O);
    var text = env.el.value;
    // Should have inserted a newline + space after first line
    expect(text).toContain('abc\n');
    expect(text.split('\n').length).toBeGreaterThanOrEqual(3);
  });
});

describe('O - open line above', () => {
  test('creates new line above', () => {
    var env = setup('abc\ndef', 5);
    pressKey(env.app, KEY.O, { shift: true });
    var text = env.el.value;
    expect(text.split('\n').length).toBeGreaterThanOrEqual(3);
  });
});

describe('Esc - return to general mode', () => {
  test('from insert mode back to general', () => {
    var env = setup('hello', 2);
    // Enter insert mode
    pressKey(env.app, KEY.I);
    // Force edit mode (setTimeout is async, so set directly)
    env.vim.switchModeTo('edit_mode');
    expect(getMode(env)).toBe('edit_mode');
    // Press Esc
    pressKey(env.app, KEY.ESC);
    expect(getMode(env)).toBe('general_mode');
  });
});

describe('v - toggle visual mode', () => {
  test('enters visual mode', () => {
    var env = setup('hello world', 3);
    pressKey(env.app, KEY.V);
    expect(getMode(env)).toBe('visual_mode');
  });

  test('exits visual mode back to general after motion', () => {
    var env = setup('hello world', 3);
    pressKey(env.app, KEY.V);
    expect(getMode(env)).toBe('visual_mode');
    // Need a motion so visualCursor gets set (toggle requires it)
    pressKey(env.app, KEY.L);
    pressKey(env.app, KEY.V);
    expect(getMode(env)).toBe('general_mode');
  });
});

describe('visual mode + motion', () => {
  test('v then l extends selection right', () => {
    var env = setup('hello world', 3);
    pressKey(env.app, KEY.V);
    pressKey(env.app, KEY.L);
    // Selection should span from visual start to cursor+1
    expect(env.el.selectionEnd).toBeGreaterThan(env.el.selectionStart);
  });

  test('v then h extends selection left', () => {
    var env = setup('hello world', 5);
    pressKey(env.app, KEY.V);
    pressKey(env.app, KEY.H);
    expect(env.el.selectionEnd).toBeGreaterThan(env.el.selectionStart);
  });
});

describe('visual mode + d deletes selection', () => {
  test('v + l + d deletes selected text', () => {
    var env = setup('hello world', 3);
    pressKey(env.app, KEY.V);
    pressKey(env.app, KEY.L);
    pressKey(env.app, KEY.L);
    pressKey(env.app, KEY.D);
    var text = env.el.value;
    expect(text.length).toBeLessThan(11);
  });
});

describe('visual mode + y copies selection', () => {
  test('v + l + y yanks selected text', () => {
    var env = setup('hello world', 0);
    pressKey(env.app, KEY.V);
    pressKey(env.app, KEY.L);
    pressKey(env.app, KEY.L);
    pressKey(env.app, KEY.Y);
    expect(env.app.clipboard).toBeTruthy();
    expect(env.app.clipboard.length).toBeGreaterThan(0);
    // Text should be unchanged
    expect(env.el.value).toBe('hello world');
  });
});
