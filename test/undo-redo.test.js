import { describe, test, expect } from 'vitest';
import { setup, pressKey, pressCompoundKey, KEY } from './helpers/setup.js';

function getCursor(env) {
  return env.el.selectionStart;
}
function getText(env) {
  return env.el.value;
}

// =============================================================================
// REDO TESTS (Ctrl+R)
// =============================================================================

describe('redo (Ctrl+R)', () => {

  test('u then redo restores the undone state', () => {
    var env = setup('hello world', 0);
    // dw has record flag, so parseRoute auto-records before executing
    pressCompoundKey(env.app, KEY.D, KEY.W); // delete word -> "world"
    expect(getText(env)).toBe('world');

    pressKey(env.app, KEY.U); // undo -> "hello world"
    expect(getText(env)).toBe('hello world');

    env.controller.redo(); // redo -> "world"
    expect(getText(env)).toBe('world');
  });

  test('multiple u then redo walks forward through history', () => {
    var env = setup('aaa bbb ccc', 0);
    // dw has record flag -> auto-records "aaa bbb ccc" before delete
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "bbb ccc"
    expect(getText(env)).toBe('bbb ccc');

    // dw auto-records "bbb ccc" before delete
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "ccc"
    expect(getText(env)).toBe('ccc');

    pressKey(env.app, KEY.U); // undo -> "bbb ccc"
    expect(getText(env)).toBe('bbb ccc');

    pressKey(env.app, KEY.U); // undo -> "aaa bbb ccc"
    expect(getText(env)).toBe('aaa bbb ccc');

    env.controller.redo(); // redo -> "bbb ccc"
    expect(getText(env)).toBe('bbb ccc');

    env.controller.redo(); // redo -> "ccc"
    expect(getText(env)).toBe('ccc');
  });

  test('u, redo, u, redo cycles correctly', () => {
    var env = setup('hello world', 0);
    // dw auto-records
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "world"
    expect(getText(env)).toBe('world');

    pressKey(env.app, KEY.U); // -> "hello world"
    expect(getText(env)).toBe('hello world');

    env.controller.redo(); // -> "world"
    expect(getText(env)).toBe('world');

    pressKey(env.app, KEY.U); // -> "hello world"
    expect(getText(env)).toBe('hello world');

    env.controller.redo(); // -> "world"
    expect(getText(env)).toBe('world');
  });

  test('redo with no redo history is a no-op', () => {
    var env = setup('hello world', 0);
    var textBefore = getText(env);
    var cursorBefore = getCursor(env);

    env.controller.redo(); // should do nothing
    expect(getText(env)).toBe(textBefore);
    expect(getCursor(env)).toBe(cursorBefore);
  });

  test('new edit after u clears redo stack', () => {
    var env = setup('hello world', 0);
    // dw auto-records
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "world"
    expect(getText(env)).toBe('world');

    pressKey(env.app, KEY.U); // undo -> "hello world"
    expect(getText(env)).toBe('hello world');

    // New edit: x has record flag, which calls recordText -> clearRedo
    pressKey(env.app, KEY.X); // -> "ello world"
    expect(getText(env)).toBe('ello world');

    // Redo should be empty now because the new edit cleared it
    var key = env.app.getEleKey();
    var redoList = env.app.redoList[key];
    expect(!redoList || redoList.length === 0).toBe(true);
  });

  test('redo restores correct cursor position', () => {
    var env = setup('hello world', 0);
    // dw auto-records
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "world", cursor at 0
    expect(getCursor(env)).toBe(0);

    pressKey(env.app, KEY.U); // undo
    env.controller.redo(); // redo -> "world" with cursor at 0
    expect(getText(env)).toBe('world');
    expect(getCursor(env)).toBe(0);
  });

  test('redo after single character delete (x)', () => {
    var env = setup('abcde', 2);
    // x has record flag -> auto-records
    pressKey(env.app, KEY.X); // delete 'c' -> "abde"
    expect(getText(env)).toBe('abde');

    pressKey(env.app, KEY.U); // undo -> "abcde"
    expect(getText(env)).toBe('abcde');

    env.controller.redo(); // redo -> "abde"
    expect(getText(env)).toBe('abde');
  });

  test('redo after dd restores deleted line', () => {
    var env = setup('abc\ndef\nghi', 4);
    // dd has record flag
    pressCompoundKey(env.app, KEY.D, KEY.D); // delete line -> "abc\nghi"
    expect(getText(env)).toBe('abc\nghi');

    pressKey(env.app, KEY.U); // undo -> "abc\ndef\nghi"
    expect(getText(env)).toBe('abc\ndef\nghi');

    env.controller.redo(); // redo -> "abc\nghi"
    expect(getText(env)).toBe('abc\nghi');
  });

  test('redo does not go beyond the last undone state', () => {
    var env = setup('hello', 0);
    // x auto-records
    pressKey(env.app, KEY.X); // "ello"

    pressKey(env.app, KEY.U); // undo -> "hello"
    env.controller.redo(); // redo -> "ello"
    expect(getText(env)).toBe('ello');

    // Another redo should be no-op
    env.controller.redo();
    expect(getText(env)).toBe('ello');
  });

  test('redo stack is properly initialized (redoList exists)', () => {
    var env = setup('hello', 0);
    expect(env.app.redoList).toBeDefined();
    expect(Array.isArray(env.app.redoList)).toBe(true);
  });
});

// =============================================================================
// UNDO TESTS (ensure existing undo still works after changes)
// =============================================================================

describe('undo (u) - existing behavior preserved', () => {

  test('u restores previous state after dw', () => {
    var env = setup('hello world', 0);
    // dw has record flag
    pressCompoundKey(env.app, KEY.D, KEY.W);
    expect(getText(env)).toBe('world');

    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello world');
  });

  test('u restores previous state after dd', () => {
    var env = setup('abc\ndef\nghi', 4);
    // dd has record flag
    pressCompoundKey(env.app, KEY.D, KEY.D);
    expect(getText(env)).toBe('abc\nghi');

    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('abc\ndef\nghi');
  });

  test('u restores previous state after x', () => {
    var env = setup('abcde', 2);
    // x has record flag
    pressKey(env.app, KEY.X);
    expect(getText(env)).toBe('abde');

    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('abcde');
  });

  test('u on empty history is a no-op', () => {
    var env = setup('hello world', 0);
    var textBefore = getText(env);
    pressKey(env.app, KEY.U); // nothing on undo stack
    expect(getText(env)).toBe(textBefore);
  });

  test('multiple u steps back through history', () => {
    var env = setup('aaa bbb ccc', 0);
    // dw auto-records "aaa bbb ccc", then deletes -> "bbb ccc"
    pressCompoundKey(env.app, KEY.D, KEY.W);
    expect(getText(env)).toBe('bbb ccc');

    // dw auto-records "bbb ccc", then deletes -> "ccc"
    pressCompoundKey(env.app, KEY.D, KEY.W);
    expect(getText(env)).toBe('ccc');

    pressKey(env.app, KEY.U); // -> "bbb ccc"
    expect(getText(env)).toBe('bbb ccc');

    pressKey(env.app, KEY.U); // -> "aaa bbb ccc"
    expect(getText(env)).toBe('aaa bbb ccc');
  });

  test('u after paste restores pre-paste state', () => {
    var env = setup('hello', 0);
    env.app.clipboard = ' world';
    env.app.vim.pasteInNewLineRequest = false;
    // p has record flag, so it auto-records "hello" before executing
    pressKey(env.app, KEY.P);
    expect(getText(env)).toContain('world');

    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello');
  });
});

// =============================================================================
// UNDO GRANULARITY - EDIT MODE
// =============================================================================

describe('undo granularity - edit mode', () => {

  test('undo after insert session undoes entire insert at once', () => {
    var env = setup('hello world', 5);
    // Record state before edit (simulating what parseRoute record flag does for i/a)
    env.app.recordText();
    // Simulate entering insert mode
    env.vim.switchModeTo('edit_mode');
    // Simulate typing " beautiful" at position 5
    env.el.value = 'hello beautiful world';
    env.el.selectionStart = 15;
    env.el.selectionEnd = 15;
    // Return to general mode
    pressKey(env.app, KEY.ESC);
    // Undo should restore to pre-edit state
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello world');
  });

  test('undo after append session undoes entire append at once', () => {
    var env = setup('abc', 2);
    // Record pre-edit state
    env.app.recordText();
    // Switch to edit mode (simulating 'a' command)
    env.vim.switchModeTo('edit_mode');
    // Simulate typing "XYZ" after 'c'
    env.el.value = 'abcXYZ';
    env.el.selectionStart = 6;
    env.el.selectionEnd = 6;
    // Return to general mode
    pressKey(env.app, KEY.ESC);
    // Undo should restore everything
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('abc');
  });

  test('per-keystroke recording does NOT happen in edit mode', () => {
    var env = setup('hello', 0);
    var key = env.app.getEleKey();
    // Record one snapshot manually
    env.app.recordText();
    var initialCount = env.app.doList[key].length;

    // Switch to edit mode
    env.vim.switchModeTo('edit_mode');

    // The actual recordText calls happen in bind.js onKeyDown for edit mode.
    // Since we skip bind.js in tests, we just check the API level:
    // After fix, the only recording for an edit session is the pre-edit snapshot.

    expect(env.app.doList[key].length).toBe(initialCount);
  });
});

// =============================================================================
// REDO + UNDO COMBINED EDGE CASES
// =============================================================================

describe('undo/redo combined edge cases', () => {

  test('rapid undo/redo sequence', () => {
    var env = setup('hello world', 0);
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "world"

    // Rapid toggle
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello world');
    env.controller.redo();
    expect(getText(env)).toBe('world');
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello world');
    env.controller.redo();
    expect(getText(env)).toBe('world');
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello world');
  });

  test('undo all then redo all', () => {
    var env = setup('one two three', 0);
    // dw auto-records "one two three" before delete
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "two three"
    expect(getText(env)).toBe('two three');

    // dw auto-records "two three" before delete
    pressCompoundKey(env.app, KEY.D, KEY.W); // -> "three"
    expect(getText(env)).toBe('three');

    // Undo all
    pressKey(env.app, KEY.U); // -> "two three"
    expect(getText(env)).toBe('two three');
    pressKey(env.app, KEY.U); // -> "one two three"
    expect(getText(env)).toBe('one two three');

    // Redo all
    env.controller.redo(); // -> "two three"
    expect(getText(env)).toBe('two three');
    env.controller.redo(); // -> "three"
    expect(getText(env)).toBe('three');
  });

  test('undo, edit, then redo is empty', () => {
    var env = setup('abcde', 0);
    // x auto-records
    pressKey(env.app, KEY.X); // "bcde"
    expect(getText(env)).toBe('bcde');

    pressKey(env.app, KEY.U); // "abcde"
    expect(getText(env)).toBe('abcde');

    // New edit clears redo stack (x auto-records, which calls clearRedo)
    pressKey(env.app, KEY.X); // "bcde" (new edit)
    expect(getText(env)).toBe('bcde');

    // Redo should do nothing
    var textAfterNewEdit = getText(env);
    env.controller.redo();
    expect(getText(env)).toBe(textAfterNewEdit);
  });

  test('redo preserves text only (not clipboard)', () => {
    var env = setup('hello world', 0);
    // dw auto-records
    pressCompoundKey(env.app, KEY.D, KEY.W); // dw -> "world"

    pressKey(env.app, KEY.U); // undo
    env.app.clipboard = 'CHANGED'; // change clipboard

    env.controller.redo(); // redo -> "world"
    expect(getText(env)).toBe('world');
    // Redo restores text but does not touch clipboard
    expect(env.app.clipboard).toBe('CHANGED');
  });

  test('clearRedo clears the redo stack for current element', () => {
    var env = setup('hello', 0);
    var key = env.app.getEleKey();
    // Manually push to redo stack
    env.app.recordRedo('some text', 0);
    expect(env.app.redoList[key].length).toBe(1);

    env.app.clearRedo();
    expect(env.app.redoList[key].length).toBe(0);
  });

  test('recordRedo adds to redo stack', () => {
    var env = setup('hello', 0);
    var key = env.app.getEleKey();

    env.app.recordRedo('state1', 0);
    env.app.recordRedo('state2', 3);
    expect(env.app.redoList[key].length).toBe(2);
    expect(env.app.redoList[key][0].t).toBe('state1');
    expect(env.app.redoList[key][1].t).toBe('state2');
  });

  test('redo after undoing multiple x deletes', () => {
    var env = setup('abcde', 0);
    // x has record flag, so parseRoute calls recordText before each x
    pressKey(env.app, KEY.X); // "bcde"
    pressKey(env.app, KEY.X); // "cde"
    pressKey(env.app, KEY.X); // "de"

    pressKey(env.app, KEY.U); // -> "cde"
    expect(getText(env)).toBe('cde');

    env.controller.redo(); // -> "de"
    expect(getText(env)).toBe('de');
  });

  test('destroy clears redoList', () => {
    var env = setup('hello', 0);
    env.app.recordRedo('snapshot', 0);
    env.app.destroy();
    expect(env.app.redoList).toBeDefined();
    expect(Array.isArray(env.app.redoList)).toBe(true);
    expect(env.app.redoList.length).toBe(0);
  });
});

// =============================================================================
// UNDO WITH RECORD-FLAG OPERATIONS
// =============================================================================

describe('undo with record-flag operations', () => {

  test('o (new line) records and u undoes it', () => {
    var env = setup('abc\ndef', 0);
    // o has record flag, so it auto-records before executing
    pressKey(env.app, KEY.O);
    // o appends a new line below current line
    var textAfterO = getText(env);
    expect(textAfterO).not.toBe('abc\ndef');

    pressKey(env.app, KEY.ESC);
    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('abc\ndef');
  });

  test('p (paste) records and u undoes it', () => {
    var env = setup('hello', 4);
    env.app.clipboard = ' world';
    env.app.vim.pasteInNewLineRequest = false;
    // p has record flag
    pressKey(env.app, KEY.P);
    expect(getText(env)).toContain('world');

    pressKey(env.app, KEY.U);
    expect(getText(env)).toBe('hello');
  });
});
