(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.vim = factory());
})(this, (function() {
  "use strict";
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var helper = {};
  var hasRequiredHelper;
  function requireHelper() {
    if (hasRequiredHelper) return helper;
    hasRequiredHelper = 1;
    helper.extend = function(to, form) {
      for (var key in form) {
        if (form.hasOwnProperty(key)) {
          to[key] = form[key];
        }
      }
      return to;
    };
    helper.indexOf = function(array, key) {
      for (var k in array) {
        if (array.hasOwnProperty(k)) {
          if (array[k] === key) {
            return k;
          }
        }
      }
      return -1;
    };
    helper.currentTime = function() {
      return (/* @__PURE__ */ new Date()).getTime();
    };
    return helper;
  }
  var router = {};
  var hasRequiredRouter;
  function requireRouter() {
    if (hasRequiredRouter) return router;
    hasRequiredRouter = 1;
    router._init = function() {
      this.currentCode = void 0;
      this._keys = {};
    };
    router.code = function(code, name) {
      if (!this._keys[code]) {
        this._keys[code] = {};
      }
      this._keys[code]["name"] = name;
      this._keys[code]["mode"] = "";
      this._keys[code]["record"] = false;
      this.currentCode = code;
      return this;
    };
    router.action = function(name, methodName) {
      if (!this.currentCode) {
        return;
      }
      this._keys[this.currentCode][name] = methodName;
      return this;
    };
    router.mode = function(mode) {
      if (!this.currentCode) {
        return;
      }
      this._keys[this.currentCode]["mode"] = mode;
      return this;
    };
    router.record = function(isRecord) {
      if (!this.currentCode) {
        return;
      }
      this._keys[this.currentCode]["record"] = isRecord;
      return this;
    };
    router.getKeys = function() {
      return this._keys;
    };
    return router;
  }
  var vim = {};
  var init$1 = {};
  var hasRequiredInit$1;
  function requireInit$1() {
    if (hasRequiredInit$1) return init$1;
    hasRequiredInit$1 = 1;
    init$1.currentMode = "general_mode";
    init$1.replaceRequest = false;
    init$1.pasteInNewLineRequest = false;
    init$1.visualPosition = void 0;
    init$1.visualCursor = void 0;
    return init$1;
  }
  var hasRequiredVim;
  function requireVim() {
    if (hasRequiredVim) return vim;
    hasRequiredVim = 1;
    const GENERAL = "general_mode";
    const COMMAND = "command_mode";
    const EDIT = "edit_mode";
    const VISUAL = "visual_mode";
    const _ENTER_ = "\n";
    var _ = requireHelper();
    var extend = _.extend;
    var textUtil;
    vim._init = function(tu) {
      extend(this, requireInit$1());
      textUtil = tu;
    };
    vim.resetVim = function() {
      this.replaceRequest = false;
      this.visualPosition = void 0;
      this.visualCursor = void 0;
    };
    vim.setTextUtil = function(tu) {
      textUtil = tu;
    };
    vim.isMode = function(modeName) {
      return this.currentMode === modeName;
    };
    vim.switchModeTo = function(modeName) {
      if (modeName === GENERAL || modeName === COMMAND || modeName === EDIT || modeName === VISUAL) {
        this.currentMode = modeName;
      }
    };
    vim.resetCursorByMouse = function() {
      this.switchModeTo(GENERAL);
      var p = textUtil.getCursorPosition();
      var sp = textUtil.getCurrLineStartPos();
      var c = textUtil.getCurrLineCount();
      if (p === sp && !c) {
        textUtil.appendText(" ", p);
      }
      var ns = textUtil.getNextSymbol(p - 1);
      if (ns && ns !== _ENTER_) {
        textUtil.select(p, p + 1);
      } else {
        textUtil.select(p - 1, p);
      }
    };
    vim.selectNextCharacter = function() {
      var p = textUtil.getCursorPosition();
      if (this.isMode(VISUAL) && this.visualCursor !== void 0) {
        p = this.visualCursor;
      }
      if (this.isMode(GENERAL) && textUtil.getNextSymbol(p) === _ENTER_) {
        return;
      }
      if (this.isMode(VISUAL) && textUtil.getNextSymbol(p - 1) === _ENTER_) {
        return;
      }
      if (p + 1 <= textUtil.getText().length) {
        var s = p + 1;
        if (this.isMode(VISUAL)) {
          s = this.visualPosition;
          this.visualCursor = p + 1;
          var f1 = this.visualCursor;
          var f2 = this.visualPosition;
          var f3 = textUtil.getCursorPosition();
        }
        textUtil.select(s, p + 2);
        if (this.isMode(VISUAL)) {
          if (s === p) {
            textUtil.select(s, p + 2);
            this.visualCursor = p + 2;
          } else {
            textUtil.select(s, p + 1);
          }
          if (f2 > f1 && f2 > f3) {
            textUtil.select(s, p + 1);
          } else if (f1 === f2 && f2 - f3 === 1) {
            this.visualPosition = f2 - 1;
            this.visualCursor = p + 2;
            textUtil.select(s - 1, p + 2);
          }
        }
      }
    };
    vim.selectPrevCharacter = function() {
      var p = textUtil.getCursorPosition();
      if (this.isMode(VISUAL) && this.visualCursor !== void 0) {
        p = this.visualCursor;
      }
      if (textUtil.getPrevSymbol(p) === _ENTER_) {
        return;
      }
      var s = p - 1;
      if (this.isMode(VISUAL)) {
        s = this.visualPosition;
        if (s < p && textUtil.getPrevSymbol(p - 1) === _ENTER_) {
          return;
        }
        if (s === p) {
          p = p + 1;
          s = s - 1;
          this.visualPosition = p;
          this.visualCursor = s;
        } else if (p === s + 1) {
          s = s + 1;
          p = p - 2;
          this.visualPosition = s;
          this.visualCursor = p;
        } else if (p === s - 1) {
          p = s - 2;
          this.visualCursor = p;
        } else {
          if (!(s < p && p + 1 === textUtil.getSelectEndPos())) {
            p = p - 1;
          }
          this.visualCursor = p;
        }
      }
      if (this.visualCursor < 0) {
        this.visualCursor = 0;
      }
      if (this.isMode(GENERAL) && s >= 0 || this.isMode(VISUAL)) {
        textUtil.select(s, p);
      }
    };
    vim.append = function() {
      var p = textUtil.getCursorPosition();
      textUtil.select(p + 1, p + 1);
    };
    vim.insert = function() {
      var p = textUtil.getCursorPosition();
      textUtil.select(p, p);
    };
    vim.selectNextLine = function() {
      var sp = void 0;
      if (this.isMode(VISUAL) && this.visualCursor !== void 0) {
        sp = this.visualCursor;
      }
      var nl = textUtil.getNextLineStart(sp);
      var nr = textUtil.getNextLineEnd(sp);
      var nc = nr - nl;
      var cc = textUtil.getCountFromStartToPosInCurrLine(sp);
      if (this.isMode(VISUAL) && this.visualCursor !== void 0 && this.visualPosition < this.visualCursor) {
        cc = cc - 1;
      }
      var p = nl + (cc > nc ? nc : cc);
      if (p <= textUtil.getText().length) {
        var s = p - 1;
        if (this.isMode(VISUAL)) {
          s = this.visualPosition;
          if (s > p) {
            p = p - 1;
          }
          this.visualCursor = p;
          if (textUtil.getSymbol(nl) === _ENTER_) {
            textUtil.appendText(" ", nl);
            p = p + 1;
            this.visualCursor = p;
            if (s > p) {
              s += 1;
              this.visualPosition = s;
            }
          }
        }
        textUtil.select(s, p);
        if (this.isMode(GENERAL)) {
          if (textUtil.getSymbol(nl) === _ENTER_) {
            textUtil.appendText(" ", nl);
          }
        }
      }
    };
    vim.selectPrevLine = function() {
      var sp = void 0;
      if (this.isMode(VISUAL) && this.visualCursor !== void 0) {
        sp = this.visualCursor;
      }
      var pl = textUtil.getPrevLineStart(sp);
      var pr = textUtil.getPrevLineEnd(sp);
      var cc = textUtil.getCountFromStartToPosInCurrLine(sp);
      if (this.isMode(VISUAL) && this.visualCursor !== void 0 && this.visualPosition < this.visualCursor) {
        cc = cc - 1;
      }
      var pc = pr - pl;
      var p = pl + (cc > pc ? pc : cc);
      if (p >= 0) {
        var s = p - 1;
        var e = p;
        if (this.isMode(VISUAL)) {
          s = this.visualPosition;
          if (textUtil.getPrevSymbol(p) !== _ENTER_ && s !== p - 1 && e < s) {
            e = p - 1;
          }
          this.visualCursor = e;
        }
        textUtil.select(s, e);
        if (this.isMode(GENERAL)) {
          if (textUtil.getSymbol(pl) === _ENTER_) {
            textUtil.appendText(" ", pl);
          }
        }
      }
    };
    vim.moveToCurrentLineHead = function() {
      var p = textUtil.getCurrLineStartPos();
      if (this.isMode(GENERAL)) {
        textUtil.select(p, p + 1);
      }
      if (this.isMode(VISUAL)) {
        var sp = this.visualCursor;
        if (sp === void 0) {
          sp = textUtil.getCursorPosition();
        }
        for (sp; sp > p; sp--) {
          this.selectPrevCharacter();
        }
      }
    };
    vim.moveToCurrentLineTail = function() {
      var p = textUtil.getCurrLineEndPos();
      if (this.isMode(GENERAL)) {
        textUtil.select(p - 1, p);
      }
      if (this.isMode(VISUAL)) {
        var sp = this.visualCursor;
        if (sp === void 0) {
          sp = textUtil.getCursorPosition();
        }
        p = textUtil.getCurrLineEndPos(sp);
        if (sp === p - 1) {
          p = p - 1;
        }
        for (sp; sp < p; sp++) {
          this.selectNextCharacter();
        }
      }
    };
    vim.appendNewLine = function() {
      var p = textUtil.getCurrLineEndPos();
      textUtil.appendText(_ENTER_ + " ", p);
      textUtil.select(p + 1, p + 1);
    };
    vim.insertNewLine = function() {
      var p = textUtil.getCurrLineStartPos();
      textUtil.appendText(" " + _ENTER_, p);
      textUtil.select(p, p);
    };
    vim.deleteSelected = function() {
      var p = textUtil.getCursorPosition();
      var t = textUtil.delSelected();
      textUtil.select(p, p + 1);
      this.pasteInNewLineRequest = false;
      return t;
    };
    vim.copyCurrentLine = function(p) {
      var sp = textUtil.getCurrLineStartPos(p);
      var ep = textUtil.getCurrLineEndPos(p);
      this.pasteInNewLineRequest = true;
      return textUtil.getText(sp, ep + 1);
    };
    vim.backToHistory = function(list) {
      if (list) {
        var data = list.pop();
        if (data !== void 0) {
          textUtil.setText(data.t);
          textUtil.select(data.p, data.p + 1);
        }
      }
    };
    vim.delCurrLine = function() {
      var sp = textUtil.getCurrLineStartPos();
      var ep = textUtil.getCurrLineEndPos();
      var t = textUtil.delete(sp, ep + 1);
      textUtil.select(sp, sp + 1);
      this.pasteInNewLineRequest = true;
      return t;
    };
    vim.moveToFirstLine = function() {
      if (this.isMode(GENERAL)) {
        textUtil.select(0, 1);
      } else if (this.isMode(VISUAL)) {
        textUtil.select(this.visualPosition, 0);
        this.visualCursor = 0;
      }
    };
    vim.moveToLastLine = function() {
      var lp = textUtil.getText().length;
      var sp = textUtil.getCurrLineStartPos(lp - 1);
      if (this.isMode(GENERAL)) {
        textUtil.select(sp, sp + 1);
      } else if (this.isMode(VISUAL)) {
        textUtil.select(this.visualPosition, sp + 1);
        this.visualCursor = sp + 1;
      }
    };
    vim.moveToNextWord = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getCurrWordPos(p);
      var sp = poses[1];
      if (sp) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp + 1);
          this.visualCursor = sp + 1;
        }
      }
    };
    vim.copyWord = function(p) {
      var poses = textUtil.getCurrWordPos(p);
      return poses[1];
    };
    vim.deleteWord = function() {
      var t;
      var poses = textUtil.getCurrWordPos();
      if (poses[1]) {
        t = textUtil.delete(poses[0], poses[1]);
        textUtil.select(poses[0], poses[0] + 1);
      }
      return t;
    };
    vim.moveToPrevWord = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getPrevWordPos(p);
      var sp = poses[0];
      if (sp !== void 0) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp);
          this.visualCursor = sp;
        }
      }
    };
    vim.moveToPrevBigWord = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getPrevBigWordPos(p);
      var sp = poses[0];
      if (sp !== void 0) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp);
          this.visualCursor = sp;
        }
      }
    };
    vim.moveToPrevSentence = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getPrevSentencePos(p);
      var sp = poses[0];
      if (sp !== void 0) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp);
          this.visualCursor = sp;
        }
      }
    };
    vim.moveToNextSentence = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getNextSentencePos(p);
      var sp = poses[0];
      if (sp !== void 0) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp + 1);
          this.visualCursor = sp + 1;
        }
      }
    };
    vim.moveToPrevParagraph = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getPrevParagraphPos(p);
      var sp = poses[0];
      if (sp !== void 0) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp);
          this.visualCursor = sp;
        }
      }
    };
    vim.moveToNextParagraph = function() {
      var p;
      if (this.isMode(VISUAL)) {
        p = this.visualCursor;
      }
      var poses = textUtil.getNextParagraphPos(p);
      var sp = poses[0];
      if (sp !== void 0) {
        if (this.isMode(GENERAL)) {
          textUtil.select(sp, sp + 1);
        } else if (this.isMode(VISUAL)) {
          textUtil.select(this.visualPosition, sp + 1);
          this.visualCursor = sp + 1;
        }
      }
    };
    vim.deletePrevWord = function() {
      var t;
      var p = textUtil.getCursorPosition();
      var poses = textUtil.getPrevWordPos(p);
      if (poses[0] !== void 0 && poses[0] < p) {
        t = textUtil.delete(poses[0], p);
        textUtil.select(poses[0], poses[0] + 1);
      }
      return t;
    };
    vim.copyPrevWord = function(p) {
      var poses = textUtil.getPrevWordPos(p);
      return poses[0];
    };
    return vim;
  }
  var text = {};
  var hasRequiredText;
  function requireText() {
    if (hasRequiredText) return text;
    hasRequiredText = 1;
    const _ENTER_ = "\n";
    var el;
    text._init = function(element) {
      el = element;
    };
    text.setEle = function(e) {
      el = e;
    };
    text.getText = function(sp, ep) {
      if (sp !== void 0 || ep !== void 0) {
        return el.value.slice(sp, ep);
      }
      return el.value;
    };
    text.setText = function(t) {
      el.value = t;
    };
    text.getSelectedText = function() {
      var t = el.value.substring(el.selectionStart, el.selectionEnd);
      return t + "";
    };
    text.getCursorPosition = function() {
      return el.selectionStart;
    };
    text.getSelectEndPos = function() {
      return el.selectionEnd;
    };
    text.select = function(start, end) {
      if (start > end) {
        var p = start;
        start = end;
        end = p;
      }
      if (start < 0) {
        start = 0;
      }
      if (end > this.getText().length) {
        end = this.getText().length;
      }
      el.setSelectionRange(start, end);
      el.focus();
    };
    text.appendText = function(t, p, paste, isNewLine) {
      var ot = this.getText();
      if (p === void 0) {
        p = this.getCursorPosition() + 1;
      }
      var nt = ot.slice(0, p) + t + ot.slice(p, ot.length);
      this.setText(nt);
      if (paste) {
        if (isNewLine && p) {
          this.select(p + 1, p + 2);
        } else {
          this.select(p + t.length, p + t.length - 1);
        }
      } else {
        this.select(p, p + t.length);
      }
    };
    text.insertText = function(t, p, paste, isNewLine) {
      var ot = this.getText();
      if (p === void 0) {
        p = this.getCursorPosition();
      }
      var nt = ot.slice(0, p) + t + ot.slice(p, ot.length);
      this.setText(nt);
      if (paste) {
        if (isNewLine) {
          this.select(p, p + 1);
        } else {
          this.select(p + t.length, p + t.length - 1);
        }
      } else {
        this.select(p, p + t.length);
      }
    };
    text.delete = function(sp, ep) {
      if (sp > ep) {
        var p = ep;
        sp = ep;
        ep = p;
      }
      if (ep - sp > 0) {
        var t = this.getText();
        var nt = t.slice(0, sp) + t.slice(ep);
        if (!nt) {
          nt = " ";
        }
        this.setText(nt);
        return t.slice(sp, ep);
      }
      return void 0;
    };
    text.delSelected = function() {
      var sp = this.getCursorPosition();
      var ep = this.getSelectEndPos();
      return this.delete(sp, ep);
    };
    text.getCountFromStartToPosInCurrLine = function(p) {
      if (p === void 0) {
        p = this.getCursorPosition();
      }
      var s = this.getCurrLineStartPos(p);
      return p - s + 1;
    };
    text.getCurrLineStartPos = function(p) {
      if (p === void 0) {
        p = this.getCursorPosition();
      }
      var sp = this.findSymbolBefore(p, _ENTER_);
      return sp || 0;
    };
    text.getCurrLineEndPos = function(p) {
      if (p === void 0) {
        p = this.getCursorPosition();
      }
      if (this.getSymbol(p) === _ENTER_) {
        return p;
      }
      var end = this.findSymbolAfter(p, _ENTER_);
      return end || this.getText().length;
    };
    text.getCurrLineCount = function(p) {
      if (p === void 0) {
        p = this.getCursorPosition();
      }
      var left = this.findSymbolBefore(p, _ENTER_);
      var right = this.findSymbolAfter(p, _ENTER_);
      if (left === void 0) {
        return right;
      }
      return right - left;
    };
    text.getNextLineStart = function(p) {
      var sp = this.getCurrLineStartPos(p);
      var cc = this.getCurrLineCount(p);
      return sp + cc + 1;
    };
    text.getNextLineEnd = function(p) {
      var start = this.getNextLineStart(p);
      if (start !== void 0) {
        var end = this.findSymbolAfter(start, _ENTER_);
        return end || this.getText().length;
      }
      return void 0;
    };
    text.getPrevLineEnd = function(pos) {
      var p = this.getCurrLineStartPos(pos);
      if (p > 0) {
        return p - 1;
      }
      return void 0;
    };
    text.getPrevLineStart = function(pos) {
      var p = this.getPrevLineEnd(pos);
      if (p !== void 0) {
        var sp = this.findSymbolBefore(p, _ENTER_);
        return sp || 0;
      }
      return void 0;
    };
    text.findSymbolBefore = function(p, char) {
      var text2 = this.getText();
      for (var i = p - 1; i >= 0; i--) {
        if (text2.charAt(i) === char) {
          return i + 1;
        }
      }
      return 0;
    };
    text.findSymbolAfter = function(p, char, char2) {
      var text2 = this.getText();
      var pattern = new RegExp(char);
      var andPattern = char2 ? new RegExp(char2) : false;
      for (var i = p; i < text2.length; i++) {
        if (pattern.test(text2.charAt(i))) {
          if (!andPattern) {
            return i;
          } else if (andPattern.test(text2.charAt(i))) {
            return i;
          }
        }
      }
      return this.getText().length;
    };
    text.getSymbol = function(p) {
      var text2 = this.getText();
      return text2.charAt(p) || void 0;
    };
    text.getNextSymbol = function(p) {
      return this.getSymbol(p + 1);
    };
    text.getPrevSymbol = function(p) {
      return this.getSymbol(p - 1);
    };
    text.getCurrWordPos = function(p) {
      p = p || this.getCursorPosition();
      var char = this.getSymbol(p);
      var patternStr;
      if (/[\w\u4e00-\u9fa5]/.test(char) && /[^\|]/.test(char)) {
        patternStr = "[^\\w一-龥]";
      } else if (/\W/.test(char) && /\S/.test(char)) {
        patternStr = "[\\w一-龥]";
      }
      var lastCharPos;
      if (patternStr) {
        var firstInvisible = this.findSymbolAfter(p, "\\s");
        var firstVisible = this.findSymbolAfter(firstInvisible, "\\S");
        lastCharPos = this.findSymbolAfter(p, patternStr, "\\S");
        lastCharPos = lastCharPos - p < firstInvisible - p ? lastCharPos : firstVisible;
      } else {
        lastCharPos = this.findSymbolAfter(p, "\\S");
      }
      if (lastCharPos < this.getText().length) {
        return [p, lastCharPos];
      }
      return [p, void 0];
    };
    text.getPrevWordPos = function(p) {
      p = p || this.getCursorPosition();
      var text2 = this.getText();
      var i = p - 1;
      if (i < 0) return [0, void 0];
      while (i > 0 && /\s/.test(text2.charAt(i))) {
        i--;
      }
      var char = text2.charAt(i);
      if (/[\w\u4e00-\u9fa5]/.test(char)) {
        while (i > 0 && /[\w\u4e00-\u9fa5]/.test(text2.charAt(i - 1))) {
          i--;
        }
      } else if (/\S/.test(char)) {
        while (i > 0 && /\W/.test(text2.charAt(i - 1)) && /\S/.test(text2.charAt(i - 1))) {
          i--;
        }
      }
      return [i, void 0];
    };
    text.getPrevBigWordPos = function(p) {
      p = p || this.getCursorPosition();
      var text2 = this.getText();
      var i = p - 1;
      if (i < 0) return [0, void 0];
      while (i > 0 && /\s/.test(text2.charAt(i))) {
        i--;
      }
      while (i > 0 && /\S/.test(text2.charAt(i - 1))) {
        i--;
      }
      return [i, void 0];
    };
    text.getPrevSentencePos = function(p) {
      p = p || this.getCursorPosition();
      var text2 = this.getText();
      if (p <= 0) return [0, void 0];
      var i = p - 1;
      while (i > 0 && /\s/.test(text2.charAt(i))) {
        i--;
      }
      if (i > 0 && /[.!?]/.test(text2.charAt(i))) {
        i--;
      }
      while (i > 0 && /\s/.test(text2.charAt(i))) {
        i--;
      }
      while (i > 0) {
        if (/[.!?]/.test(text2.charAt(i))) {
          var j = i + 1;
          while (j < text2.length && /\s/.test(text2.charAt(j))) {
            j++;
          }
          return [j, void 0];
        }
        if (text2.charAt(i) === "\n" && i > 0 && text2.charAt(i - 1) === "\n") {
          var j = i + 1;
          while (j < text2.length && /\s/.test(text2.charAt(j))) {
            j++;
          }
          return [j, void 0];
        }
        i--;
      }
      return [0, void 0];
    };
    text.getNextSentencePos = function(p) {
      p = p || this.getCursorPosition();
      var text2 = this.getText();
      var len = text2.length;
      if (p >= len - 1) return [len - 1, void 0];
      var i = p;
      while (i < len) {
        if (/[.!?]/.test(text2.charAt(i))) {
          i++;
          while (i < len && /\s/.test(text2.charAt(i))) {
            i++;
          }
          if (i < len) {
            return [i, void 0];
          }
          return [len - 1, void 0];
        }
        if (i < len - 1 && text2.charAt(i) === "\n" && text2.charAt(i + 1) === "\n") {
          i += 2;
          while (i < len && /\s/.test(text2.charAt(i))) {
            i++;
          }
          if (i < len) {
            return [i, void 0];
          }
          return [len - 1, void 0];
        }
        i++;
      }
      return [len - 1, void 0];
    };
    text.getPrevParagraphPos = function(p) {
      p = p || this.getCursorPosition();
      var text2 = this.getText();
      if (p <= 0) return [0, void 0];
      var i = p - 1;
      while (i > 0 && text2.charAt(i) === "\n") {
        i--;
      }
      while (i > 0) {
        if (text2.charAt(i) === "\n" && text2.charAt(i - 1) === "\n") {
          return [i, void 0];
        }
        i--;
      }
      return [0, void 0];
    };
    text.getNextParagraphPos = function(p) {
      p = p || this.getCursorPosition();
      var text2 = this.getText();
      var len = text2.length;
      if (p >= len - 1) return [len - 1, void 0];
      var i = p + 1;
      while (i < len - 1 && text2.charAt(i) === "\n") {
        i++;
      }
      while (i < len - 1) {
        if (text2.charAt(i) === "\n" && text2.charAt(i + 1) === "\n") {
          return [i + 1, void 0];
        }
        i++;
      }
      return [len - 1, void 0];
    };
    return text;
  }
  var controller = {};
  var hasRequiredController;
  function requireController() {
    if (hasRequiredController) return controller;
    hasRequiredController = 1;
    const GENERAL = "general_mode";
    const EDIT = "edit_mode";
    const VISUAL = "visual_mode";
    const _ENTER_ = "\n";
    var App;
    var vim2;
    var textUtil;
    var _timeoutIds = [];
    controller._init = function(app2) {
      App = app2;
      vim2 = app2.vim;
      textUtil = app2.textUtil;
    };
    controller.setVim = function(v) {
      vim2 = v;
    };
    controller.setTextUtil = function(tu) {
      textUtil = tu;
    };
    controller.selectPrevCharacter = function(num) {
      App.repeatAction(function() {
        vim2.selectPrevCharacter();
      }, num);
    };
    controller.selectNextCharacter = function(num) {
      App.repeatAction(function() {
        vim2.selectNextCharacter();
      }, num);
    };
    controller.switchModeToGeneral = function() {
      var cMode = vim2.currentMode;
      if (vim2.isMode(GENERAL)) {
        return;
      }
      vim2.switchModeTo(GENERAL);
      var p = textUtil.getCursorPosition();
      var sp = textUtil.getCurrLineStartPos();
      if (p === sp) {
        var c = textUtil.getCurrLineCount();
        if (!c) {
          textUtil.appendText(" ", p);
        }
        vim2.selectNextCharacter();
        vim2.selectPrevCharacter();
        if (textUtil.getCurrLineCount() === 1) {
          textUtil.select(p, p + 1);
        }
      } else {
        if (cMode === VISUAL) {
          vim2.selectNextCharacter();
        }
        vim2.selectPrevCharacter();
      }
    };
    controller.switchModeToVisual = function() {
      if (vim2.isMode(VISUAL)) {
        var s = vim2.visualCursor;
        if (s === void 0) {
          return;
        }
        var p = vim2.visualPosition;
        if (p < s) {
          textUtil.select(s - 1, s);
        } else {
          textUtil.select(s, s + 1);
        }
        if (textUtil.getPrevSymbol(s) === _ENTER_) {
          textUtil.select(s, s + 1);
        }
        vim2.switchModeTo(GENERAL);
        return;
      }
      vim2.switchModeTo(VISUAL);
      vim2.visualPosition = textUtil.getCursorPosition();
      vim2.visualCursor = void 0;
    };
    controller.append = function() {
      vim2.append();
      _timeoutIds.push(setTimeout(function() {
        vim2.switchModeTo(EDIT);
      }, 100));
    };
    controller.appendLineTail = function() {
      vim2.moveToCurrentLineTail();
      this.append();
    };
    controller.insert = function() {
      vim2.insert();
      _timeoutIds.push(setTimeout(function() {
        vim2.switchModeTo(EDIT);
      }, 100));
    };
    controller.insertLineHead = function() {
      vim2.moveToCurrentLineHead();
      this.insert();
    };
    controller.selectNextLine = function(num) {
      App.repeatAction(function() {
        vim2.selectNextLine();
      }, num);
    };
    controller.selectPrevLine = function(num) {
      App.repeatAction(function() {
        vim2.selectPrevLine();
      }, num);
    };
    controller.copyChar = function() {
      vim2.pasteInNewLineRequest = false;
      App.clipboard = textUtil.getSelectedText();
      if (vim2.isMode(VISUAL)) {
        this.switchModeToGeneral();
      }
    };
    controller.copyCurrentLine = function(num) {
      var _data = { p: void 0, t: "" };
      App.repeatAction(function() {
        _data.t = vim2.copyCurrentLine(_data.p);
        _data.p = textUtil.getNextLineStart(_data.p);
        return _data.t;
      }, num);
    };
    controller.pasteAfter = function() {
      if (App.clipboard !== void 0) {
        if (vim2.pasteInNewLineRequest) {
          var ep = textUtil.getCurrLineEndPos();
          textUtil.appendText(_ENTER_ + App.clipboard, ep, true, true);
        } else {
          textUtil.appendText(App.clipboard, void 0, true, false);
        }
      }
    };
    controller.pasteBefore = function() {
      if (App.clipboard !== void 0) {
        if (vim2.pasteInNewLineRequest) {
          var sp = textUtil.getCurrLineStartPos();
          textUtil.insertText(App.clipboard + _ENTER_, sp, true, true);
        } else {
          textUtil.insertText(App.clipboard, void 0, true, false);
        }
      }
    };
    controller.moveToCurrentLineHead = function() {
      vim2.moveToCurrentLineHead();
    };
    controller.moveToCurrentLineTail = function() {
      vim2.moveToCurrentLineTail();
    };
    controller.replaceChar = function() {
      vim2.replaceRequest = true;
    };
    controller.appendNewLine = function() {
      vim2.appendNewLine();
      _timeoutIds.push(setTimeout(function() {
        vim2.switchModeTo(EDIT);
      }, 100));
    };
    controller.insertNewLine = function() {
      vim2.insertNewLine();
      _timeoutIds.push(setTimeout(function() {
        vim2.switchModeTo(EDIT);
      }, 100));
    };
    controller.delCharAfter = function(num) {
      App.repeatAction(function() {
        return vim2.deleteSelected();
      }, num);
      this.switchModeToGeneral();
    };
    controller.backToHistory = function() {
      var key = App.getEleKey();
      var list = App.doList[key];
      vim2.backToHistory(list);
    };
    controller.delCurrLine = function(num) {
      App.repeatAction(function() {
        return vim2.delCurrLine();
      }, num);
    };
    controller.moveToFirstLine = function() {
      vim2.moveToFirstLine();
    };
    controller.moveToLastLine = function() {
      vim2.moveToLastLine();
    };
    controller.moveToNextWord = function(num) {
      App.repeatAction(function() {
        vim2.moveToNextWord();
      }, num);
    };
    controller.copyWord = function(num) {
      vim2.pasteInNewLineRequest = false;
      var sp = textUtil.getCursorPosition();
      var ep;
      App.repeatAction(function() {
        ep = vim2.copyWord(ep);
      }, num);
      App.clipboard = textUtil.getText(sp, ep);
    };
    controller.deleteWord = function(num) {
      vim2.pasteInNewLineRequest = false;
      App.repeatAction(function() {
        return vim2.deleteWord();
      }, num);
    };
    controller.moveToPrevWord = function(num) {
      App.repeatAction(function() {
        vim2.moveToPrevWord();
      }, num);
    };
    controller.moveToPrevBigWord = function(num) {
      App.repeatAction(function() {
        vim2.moveToPrevBigWord();
      }, num);
    };
    controller.moveToPrevSentence = function(num) {
      App.repeatAction(function() {
        vim2.moveToPrevSentence();
      }, num);
    };
    controller.moveToNextSentence = function(num) {
      App.repeatAction(function() {
        vim2.moveToNextSentence();
      }, num);
    };
    controller.moveToPrevParagraph = function(num) {
      App.repeatAction(function() {
        vim2.moveToPrevParagraph();
      }, num);
    };
    controller.moveToNextParagraph = function(num) {
      App.repeatAction(function() {
        vim2.moveToNextParagraph();
      }, num);
    };
    controller.deletePrevWord = function(num) {
      vim2.pasteInNewLineRequest = false;
      App.repeatAction(function() {
        return vim2.deletePrevWord();
      }, num);
    };
    controller.copyPrevWord = function(num) {
      vim2.pasteInNewLineRequest = false;
      var ep = textUtil.getCursorPosition();
      var sp;
      App.repeatAction(function() {
        sp = vim2.copyPrevWord(sp);
      }, num);
      App.clipboard = textUtil.getText(sp, ep);
    };
    controller.destroy = function() {
      for (var i = 0; i < _timeoutIds.length; i++) {
        clearTimeout(_timeoutIds[i]);
      }
      _timeoutIds = [];
      App = null;
      vim2 = null;
      textUtil = null;
    };
    return controller;
  }
  var app = {};
  var config;
  var hasRequiredConfig;
  function requireConfig() {
    if (hasRequiredConfig) return config;
    hasRequiredConfig = 1;
    config = {
      /**
       * whether to print debut messages
       */
      debug: false,
      /**
       * how to show msg from vim app
       * @param msg
       * @param code
       */
      showMsg: function(msg, code) {
        console.warn("vim.js: " + msg);
      },
      /**
       * key codes white list of vim,
       * they are effective in general and visual mode
       */
      key_code_white_list: [9, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
    };
    return config;
  }
  var routes = {};
  var hasRequiredRoutes;
  function requireRoutes() {
    if (hasRequiredRoutes) return routes;
    hasRequiredRoutes = 1;
    routes.ready = function(router2) {
      router2.code(35, "End").action("End", "moveToCurrentLineTail");
      router2.code(36, "Home").action("Home", "moveToCurrentLineHead");
      router2.code(37, "Left").action("Left", "selectPrevCharacter");
      router2.code(38, "Up").action("Up", "selectPrevLine");
      router2.code(39, "Right").action("Right", "selectNextCharacter");
      router2.code(40, "Down").action("Down", "selectNextLine");
      router2.code(45, "Insert").action("Insert", "insert");
      router2.code(46, "Delete").action("Delete", "delCharAfter").record(true);
      router2.code(48, "0").action(0, "moveToCurrentLineHead").action("shift_0", "moveToNextSentence");
      router2.code(52, "4").action("shift_4", "moveToCurrentLineTail");
      router2.code(65, "a").action("a", "append").action("A", "appendLineTail");
      router2.code(73, "i").action("i", "insert").action("I", "insertLineHead");
      router2.code(79, "o").action("o", "appendNewLine").action("O", "insertNewLine").record(true);
      router2.code(82, "r").action("r", "replaceChar");
      router2.code(13, "enter").action("enter", "selectNextLine");
      router2.code(74, "j").action("j", "selectNextLine");
      router2.code(75, "k").action("k", "selectPrevLine");
      router2.code(72, "h").action("h", "selectPrevCharacter");
      router2.code(76, "l").action("l", "selectNextCharacter");
      router2.code(80, "p").action("p", "pasteAfter").action("P", "pasteBefore").record(true);
      router2.code(85, "u").action("u", "backToHistory");
      router2.code(89, "y").action("y", "copyChar").mode("visual_mode");
      router2.code("89_89", "yy").action("yy", "copyCurrentLine");
      router2.code(86, "v").action("v", "switchModeToVisual").action("V", "switchModeToVisual");
      router2.code(88, "x").action("x", "delCharAfter").action("X", "delCharBefore").record(true);
      router2.code(68, "d").action("d", "delCharAfter").mode("visual_mode").record(true);
      router2.code("68_68", "dd").action("dd", "delCurrLine").record(true);
      router2.code(71, "g").action("G", "moveToLastLine");
      router2.code("71_71", "gg").action("gg", "moveToFirstLine");
      router2.code(87, "w").action("w", "moveToNextWord").action("W", "moveToNextWord");
      router2.code(66, "b").action("b", "moveToPrevWord").action("B", "moveToPrevBigWord");
      router2.code("89_87", "yw").action("yw", "copyWord");
      router2.code("68_87", "dw").action("dw", "deleteWord").record(true);
      router2.code("89_66", "yb").action("yb", "copyPrevWord");
      router2.code("68_66", "db").action("db", "deletePrevWord").record(true);
      router2.code(57, "9").action("shift_9", "moveToPrevSentence");
      router2.code(219, "[").action("shift_[", "moveToPrevParagraph");
      router2.code(221, "]").action("shift_]", "moveToNextParagraph");
    };
    return routes;
  }
  var bind = {};
  var filter = {};
  var hasRequiredFilter;
  function requireFilter() {
    if (hasRequiredFilter) return filter;
    hasRequiredFilter = 1;
    const GENERAL = "general_mode";
    const VISUAL = "visual_mode";
    filter.code = function(App, code) {
      var passed = true;
      if (code === 229) {
        if (App.vim.isMode(GENERAL) || App.vim.isMode(VISUAL)) {
          passed = false;
          var msg = "Execution failure! Please use the vim instructions in the English input method.";
          App._log(msg);
          App.config.showMsg(msg);
        }
      }
      return passed;
    };
    return filter;
  }
  var hasRequiredBind;
  function requireBind() {
    if (hasRequiredBind) return bind;
    hasRequiredBind = 1;
    const GENERAL = "general_mode";
    const VISUAL = "visual_mode";
    var _ = requireHelper();
    var filter2 = requireFilter();
    var App;
    var _timeoutIds = [];
    var _boundListeners = [];
    bind.listen = function(app2) {
      App = app2;
      var boxes = window.document.querySelectorAll("input, textarea");
      App.boxes = boxes;
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        box.addEventListener("focus", onFocus);
        box.addEventListener("click", onClick);
        box.addEventListener("keydown", onKeyDown);
        _boundListeners.push({ element: box, type: "focus", handler: onFocus });
        _boundListeners.push({ element: box, type: "click", handler: onClick });
        _boundListeners.push({ element: box, type: "keydown", handler: onKeyDown });
      }
      App._on("reset_cursor_position", function(e) {
        if (App.vim.isMode(GENERAL) || App.vim.isMode(VISUAL)) {
          App.vim.resetCursorByMouse();
        }
      });
      App._on("input", function(ev, replaced) {
        var code = getCode(ev);
        App._log("mode:" + App.vim.currentMode);
        if (replaced) {
          App.recordText();
          return;
        }
        if (filter2.code(App, code)) {
          var unionCode = App.isUnionCode(code, -1);
          var vimKeys = App.router.getKeys();
          if (unionCode && vimKeys[unionCode]) {
            code = unionCode;
          }
          App._log("key code:" + code);
          var num = App.numberManager(code);
          App.parseRoute(code, ev, num);
        }
      });
    };
    bind.destroy = function() {
      for (var i = 0; i < _boundListeners.length; i++) {
        var entry = _boundListeners[i];
        entry.element.removeEventListener(entry.type, entry.handler);
      }
      _boundListeners = [];
      for (var j = 0; j < _timeoutIds.length; j++) {
        clearTimeout(_timeoutIds[j]);
      }
      _timeoutIds = [];
      App = null;
    };
    bind.trackTimeout = function(id) {
      _timeoutIds.push(id);
      return id;
    };
    function onFocus() {
      App.currentEle = this;
      App.textUtil.setEle(this);
      App.vim.setTextUtil(App.textUtil);
      App.vim.resetVim();
      App.controller.setVim(App.vim);
      App.controller.setTextUtil(App.textUtil);
      App.initNumber();
    }
    function onClick(e) {
      var ev = e || event || window.event;
      App._fire("reset_cursor_position", ev);
    }
    function onKeyDown(e) {
      var replaced = false;
      var ev = getEvent(e);
      var code = getCode(e);
      if (_.indexOf(App.key_code_white_list, code) !== -1) {
        return;
      }
      if (App.vim.isMode(GENERAL) || App.vim.isMode(VISUAL)) {
        if (App.vim.replaceRequest) {
          replaced = true;
          App.vim.replaceRequest = false;
          _timeoutIds.push(setTimeout(function() {
            App.vim.selectPrevCharacter();
          }, 50));
        } else {
          if (ev.preventDefault) {
            ev.preventDefault();
          } else {
            ev.returnValue = false;
          }
        }
      } else {
        if (code !== 27) {
          var p = App.textUtil.getCursorPosition();
          App.recordText(void 0, p - 1 >= 0 ? p - 1 : p);
        }
      }
      App._fire("input", ev, replaced);
    }
    function getEvent(e) {
      return e || event || window.event;
    }
    function getCode(ev) {
      var e = getEvent(ev);
      return e.keyCode || e.which || e.charCode;
    }
    return bind;
  }
  var init = {};
  var hasRequiredInit;
  function requireInit() {
    if (hasRequiredInit) return init;
    hasRequiredInit = 1;
    init.currentEle = void 0;
    init.boxes = void 0;
    init.config = void 0;
    init.router = void 0;
    init.vim = void 0;
    init.textUtil = void 0;
    init.clipboard = void 0;
    init.doList = [];
    init.doListDeep = 100;
    init.prevCode = void 0;
    init.prevCodeTime = 0;
    init._number = "";
    init.key_code_white_list = [];
    return init;
  }
  var hasRequiredApp;
  function requireApp() {
    if (hasRequiredApp) return app;
    hasRequiredApp = 1;
    const GENERAL = "general_mode";
    const VISUAL = "visual_mode";
    const _ENTER_ = "\n";
    var _ = requireHelper();
    var config2 = requireConfig();
    var routes2 = requireRoutes();
    var bind2 = requireBind();
    var extend = _.extend;
    app.classes = {};
    app._init = function(options) {
      extend(this, requireInit());
      this.config = extend(config2, options);
      this.key_code_white_list = config2.key_code_white_list;
      this.router = this.createClass("Router");
      this.textUtil = this.createClass("TextUtil", this.currentEle);
      this.vim = this.createClass("Vim", this.textUtil);
      this.controller = this.createClass("Controller", this);
      this._log(this);
      this._start();
    };
    app._start = function() {
      this._route();
      this._bind();
    };
    app._route = function() {
      routes2.ready(this.router);
    };
    app._bind = function() {
      bind2.listen(this);
    };
    app.destroy = function() {
      bind2.destroy();
      if (this.controller && this.controller.destroy) {
        this.controller.destroy();
      }
      this._events = {};
      this.boxes = void 0;
      this.currentEle = void 0;
      this.router = void 0;
      this.vim = void 0;
      this.textUtil = void 0;
      this.controller = void 0;
      this.clipboard = void 0;
      this.doList = [];
    };
    app._on = function(event2, fn) {
      if (!this._events) {
        this._events = {};
      }
      if (typeof fn === "function") {
        this._events[event2] = fn;
      }
      return this;
    };
    app._fire = function(event2) {
      if (!this._events || !this._events[event2]) {
        return;
      }
      var args = Array.prototype.slice.call(arguments, 1) || [];
      var fn = this._events[event2];
      fn.apply(this, args);
      return this;
    };
    app._log = function(msg, debug) {
      debug = debug ? debug : this.config.debug;
      if (debug) {
        console.log(msg);
      }
    };
    app.repeatAction = function(action, num) {
      if (typeof action !== "function") {
        return;
      }
      var res = void 0;
      if (num === void 0 || isNaN(num)) {
        num = 1;
      }
      for (var i = 0; i < num; i++) {
        res = action.apply();
        if (res) {
          if (!i) {
            this.clipboard = "";
          }
          if (i === num - 1) {
            res = res.replace(_ENTER_, "");
          }
          this.clipboard = this.clipboard + res;
        }
      }
    };
    app.recordText = function(t, p) {
      t = t === void 0 ? this.textUtil.getText() : t;
      p = p === void 0 ? this.textUtil.getCursorPosition() : p;
      var data = {
        "t": t,
        "p": p
      };
      var key = this.getEleKey();
      if (!this.doList[key]) {
        this.doList[key] = [];
      }
      if (this.doList[key].length >= this.doListDeep) {
        this.doList[key].shift();
      }
      this.doList[key].push(data);
      this._log(this.doList);
    };
    app.getEleKey = function() {
      return _.indexOf(this.boxes, this.currentEle);
    };
    app.numberManager = function(code) {
      if (code === 68 || code === 89) {
        return void 0;
      }
      var num = String.fromCharCode(code);
      if (!isNaN(num) && num >= 0 && num <= 9) {
        this._number = this._number + "" + num;
        this._log("number:" + this._number);
      } else {
        var n = this._number;
        this.initNumber();
        if (n) {
          return parseInt(n);
        }
      }
      return void 0;
    };
    app.initNumber = function() {
      this._number = "";
    };
    app.isUnionCode = function(code, maxTime) {
      if (maxTime === void 0) {
        maxTime = 600;
      }
      var ct = _.currentTime();
      var pt = this.prevCodeTime;
      var pc = this.prevCode;
      this.prevCode = code;
      this.prevCodeTime = ct;
      if (pc && (maxTime < 0 || ct - pt <= maxTime)) {
        if (pc === code) {
          this.prevCode = void 0;
        }
        return pc + "_" + code;
      }
      return void 0;
    };
    app.parseRoute = function(code, ev, num) {
      var c = this.controller;
      var param = num;
      var vimKeys = this.router.getKeys();
      if (code === 27) {
        c.switchModeToGeneral();
        return;
      }
      if (vimKeys[code] && (this.vim.isMode(GENERAL) || this.vim.isMode(VISUAL))) {
        var mode = vimKeys[code]["mode"];
        if (mode && !this.vim.isMode(mode)) {
          return false;
        }
        var keyName = vimKeys[code]["name"];
        if (ev.shiftKey) {
          if (keyName === keyName.toUpperCase()) {
            keyName = "shift_" + keyName;
          } else {
            keyName = keyName.toUpperCase();
          }
        }
        var methodName = vimKeys[code][keyName];
        this._log(methodName + "(param)");
        if (methodName) {
          if (typeof c[methodName] !== "function") {
            this._log('parseRoute: unknown method "' + methodName + '"', true);
            return;
          }
          if (vimKeys[code]["record"]) {
            this.recordText();
          }
          c[methodName](param);
          this.initNumber();
        }
      }
    };
    app.class = function(name, fn) {
      if (!name) {
        throw new Error("first param is required");
      }
      if (typeof fn !== "function") {
        throw new Error("second param must be a function");
      }
      this.classes[name] = fn;
    };
    app.createClass = function(name, arg) {
      var fn = this.classes[name];
      if (typeof fn !== "function") {
        throw new Error("class " + name + " not define");
      }
      return new fn(arg);
    };
    return app;
  }
  var src;
  var hasRequiredSrc;
  function requireSrc() {
    if (hasRequiredSrc) return src;
    hasRequiredSrc = 1;
    var _ = requireHelper();
    var extend = _.extend;
    var p;
    function Router() {
      this._init();
    }
    p = Router.prototype;
    extend(p, requireRouter());
    function Vim(textUtil) {
      this._init(textUtil);
    }
    p = Vim.prototype;
    extend(p, requireVim());
    function TextUtil(element) {
      this._init(element);
    }
    p = TextUtil.prototype;
    extend(p, requireText());
    function Controller(app2) {
      this._init(app2);
    }
    p = Controller.prototype;
    extend(p, requireController());
    function App(options) {
      this._init(options);
    }
    p = App.prototype;
    extend(p, requireApp());
    p.class("Router", Router);
    p.class("Vim", Vim);
    p.class("TextUtil", TextUtil);
    p.class("Controller", Controller);
    var vimApi = {
      open: function(options) {
        this._app = new App(options);
        return this._app;
      },
      destroy: function() {
        if (this._app) {
          this._app.destroy();
          this._app = null;
        }
      }
    };
    window.vim = vimApi;
    src = vimApi;
    return src;
  }
  var srcExports = requireSrc();
  const index = /* @__PURE__ */ getDefaultExportFromCjs(srcExports);
  return index;
}));
//# sourceMappingURL=vim.js.map
