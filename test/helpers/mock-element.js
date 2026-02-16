/**
 * Mock DOM element implementing the APIs that TextUtil needs:
 * value (get/set), selectionStart, selectionEnd, setSelectionRange(s, e), focus()
 */
export function createMockElement(text, cursorStart, cursorEnd) {
  return {
    value: text || '',
    selectionStart: cursorStart || 0,
    selectionEnd: cursorEnd !== undefined ? cursorEnd : (cursorStart || 0) + 1,
    setSelectionRange(s, e) {
      this.selectionStart = s;
      this.selectionEnd = e;
    },
    focus() {},
  };
}
