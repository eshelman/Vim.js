/**
 * Created by top on 15-9-6.
 */
const GENERAL = 'general_mode';
const COMMAND = 'command_mode';
const EDIT    = 'edit_mode';
const VISUAL  = 'visual_mode';
const _ENTER_ = '\n';

var _ = require('../../util/helper.js');
var extend = _.extend;
var textUtil;

exports._init = function (tu) {
    extend(this, require('./init.js'));
    textUtil = tu;
};

exports.resetVim = function() {
    this.replaceRequest = false;
    this.findCharRequest = null;
    this.textObjectRequest = null;
    this.visualPosition = undefined;
    this.visualCursor = undefined;
}

exports.setTextUtil = function(tu) {
    textUtil = tu;
}

exports.isMode = function (modeName) {
    return this.currentMode === modeName
};

exports.switchModeTo = function (modeName) {
    if (modeName === GENERAL || modeName === COMMAND || modeName === EDIT || modeName === VISUAL) {
        this.currentMode = modeName;
    }
};

exports.resetCursorByMouse = function() {
    this.switchModeTo(GENERAL);
    var p = textUtil.getCursorPosition();
    var sp = textUtil.getCurrLineStartPos();
    var c = textUtil.getCurrLineCount();
    if (p === sp && !c) {
        textUtil.appendText(' ', p);
    }
    var ns = textUtil.getNextSymbol(p-1);
    if (ns && ns !== _ENTER_) {
        textUtil.select(p, p+1);
    } else {
        textUtil.select(p-1, p);
    }
};

exports.selectNextCharacter = function() {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    if (this.isMode(GENERAL) && textUtil.getNextSymbol(p) === _ENTER_) {
        return;
    }
    if (this.isMode(VISUAL) && textUtil.getNextSymbol(p-1) === _ENTER_) {
        return;
    }
    if (p+1 <= textUtil.getText().length) {
        var s = p+1;
        if (this.isMode(VISUAL)) {
            s = this.visualPosition;
            this.visualCursor = p+1;
            var f1 = this.visualCursor;
            var f2 = this.visualPosition;
            var f3 = textUtil.getCursorPosition();
        }
        //default
        textUtil.select(s, p+2);
        //special
        if (this.isMode(VISUAL)) {
            if (s === p) {
                textUtil.select(s, p+2);
                this.visualCursor = p+2;
            } else {
                textUtil.select(s, p+1);
            }
            if (f2 > f1 && f2 > f3) {
                textUtil.select(s, p+1);
            } else if (f1 === f2 && f2 - f3 === 1) {
                //textUtil.select(s, p+1);
                this.visualPosition = f2-1;
                this.visualCursor = p+2;
                textUtil.select(s-1, p+2);
            }
        }
    }
};

exports.selectPrevCharacter = function() {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    if (textUtil.getPrevSymbol(p) === _ENTER_) {
        return;
    }
    var s = p-1;
    if (this.isMode(VISUAL)) {
        s = this.visualPosition;
        if (s < p && textUtil.getPrevSymbol(p-1) === _ENTER_) {
            return;
        }
        if (s === p) {
            p = p+1;
            s = s-1;
            this.visualPosition = p;
            this.visualCursor = s;
        } else if (p === s+1) {
            s = s+1;
            p = p-2;
            this.visualPosition = s;
            this.visualCursor = p;
        } else if (p === s-1) {
            p = s-2;
            this.visualCursor = p;
        } else {
            //default
            if (!(s < p && (p+1 === textUtil.getSelectEndPos()))) {
                p = p-1;
            }
            this.visualCursor = p;
        }
    }
    if (this.visualCursor < 0) {
        this.visualCursor = 0;
    }
    if ((this.isMode(GENERAL) && s>=0) || this.isMode(VISUAL)) {
        textUtil.select(s, p);
    }
};

exports.append = function () {
    var p = textUtil.getCursorPosition();
    textUtil.select(p+1, p+1);
};

exports.insert = function () {
    var p = textUtil.getCursorPosition();
    textUtil.select(p, p);
};

exports.selectNextLine = function () {
    var sp = undefined;
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        sp = this.visualCursor;
    }
    var nl = textUtil.getNextLineStart(sp);
    var nr = textUtil.getNextLineEnd(sp);
    var nc = nr - nl;
    var cc = textUtil.getCountFromStartToPosInCurrLine(sp);
    if (this.isMode(VISUAL) && this.visualCursor !== undefined && this.visualPosition < this.visualCursor) {
        cc = cc-1;
    }
    var p = nl + (cc > nc ? nc : cc);
    if (p <= textUtil.getText().length) {
        var s = p-1;
        if (this.isMode(VISUAL)) {
            s = this.visualPosition;
            if (s > p) {
                p = p-1;
            }
            this.visualCursor = p;
            if (textUtil.getSymbol(nl) === _ENTER_) {
                textUtil.appendText(' ', nl);
                p = p+1;
                this.visualCursor = p;
                if (s > p) {
                    //因为新加了空格符，导致字符总数增加，visual开始位置相应增加
                    s += 1;
                    this.visualPosition = s;
                }
            }
        }
        textUtil.select(s, p);
        if (this.isMode(GENERAL)) {
            if (textUtil.getSymbol(nl) === _ENTER_) {
                textUtil.appendText(' ', nl);
            }
        }
    }
};

exports.selectPrevLine = function () {
    var sp = undefined;
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        sp = this.visualCursor;
    }
    var pl = textUtil.getPrevLineStart(sp);
    var pr = textUtil.getPrevLineEnd(sp);
    var cc = textUtil.getCountFromStartToPosInCurrLine(sp);
    if (this.isMode(VISUAL) && this.visualCursor !== undefined && this.visualPosition < this.visualCursor) {
        cc = cc-1;
    }
    var pc = pr - pl;
    var p = pl + (cc > pc ? pc : cc);
    if (p >= 0) {
        var s = p-1;
        var e = p;
        if (this.isMode(VISUAL)) {
            s = this.visualPosition;
            if (textUtil.getPrevSymbol(p) !== _ENTER_ && s !== p-1 && e < s) {
                e = p-1;
            }
            this.visualCursor = e;
        }
        textUtil.select(s, e);
        if (this.isMode(GENERAL)) {
            if (textUtil.getSymbol(pl) === _ENTER_) {
                textUtil.appendText(' ', pl);
            }
        }
    }
};

exports.moveToCurrentLineHead = function () {
    var p = textUtil.getCurrLineStartPos();
    if (this.isMode(GENERAL)) {
        textUtil.select(p, p+1);
    }
    if (this.isMode(VISUAL)) {
        var sp = this.visualCursor;
        if (sp === undefined) {
            sp = textUtil.getCursorPosition();
        }
        for (sp;sp>p;sp--) {
            this.selectPrevCharacter();
        }
    }
};

exports.moveToCurrentLineTail = function () {
    var p = textUtil.getCurrLineEndPos();
    if (this.isMode(GENERAL)) {
        textUtil.select(p - 1, p);
    }
    if (this.isMode(VISUAL)) {
        var sp = this.visualCursor;
        if (sp === undefined) {
            sp = textUtil.getCursorPosition();
        }
        p = textUtil.getCurrLineEndPos(sp);
        if (sp === p-1) {
            p = p-1
        }
        for (sp;sp<p;sp++){
            this.selectNextCharacter();
        }
    }
};

exports.appendNewLine = function () {
    var p = textUtil.getCurrLineEndPos();
    textUtil.appendText(_ENTER_ + " ", p);
    textUtil.select(p+1, p+1);
};

exports.insertNewLine = function () {
    var p = textUtil.getCurrLineStartPos();
    textUtil.appendText(" " + _ENTER_, p);
    textUtil.select(p, p);
};

exports.deleteSelected = function () {
    var p = textUtil.getCursorPosition();
    var t = textUtil.delSelected();
    textUtil.select(p, p+1);
    this.pasteInNewLineRequest = false;
    return t;
};

exports.copyCurrentLine = function (p) {
    var sp = textUtil.getCurrLineStartPos(p);
    var ep = textUtil.getCurrLineEndPos(p);
    //clipboard = textUtil.getText(sp, ep);
    this.pasteInNewLineRequest= true;
    return textUtil.getText(sp, ep+1);
};

exports.backToHistory = function (list) {
    if (list) {
        var data = list.pop();
        if (data !== undefined) {
            textUtil.setText(data.t);
            textUtil.select(data.p, data.p+1);
        }
    }
};

exports.delCurrLine = function () {
    var sp = textUtil.getCurrLineStartPos();
    var ep = textUtil.getCurrLineEndPos();
    var t = textUtil.delete(sp, ep+1);
    textUtil.select(sp, sp+1);
    this.pasteInNewLineRequest = true;
    return t;
};

exports.moveToFirstLine = function () {
    if (this.isMode(GENERAL)) {
        textUtil.select(0,1);
    } else if (this.isMode(VISUAL)) {
        textUtil.select(this.visualPosition, 0);
        this.visualCursor = 0;
    }
};

exports.moveToLastLine = function () {
    var lp = textUtil.getText().length;
    var sp = textUtil.getCurrLineStartPos(lp-1);
    if (this.isMode(GENERAL)) {
        textUtil.select(sp, sp+1);
    } else if (this.isMode(VISUAL)) {
        textUtil.select(this.visualPosition, sp+1);
        this.visualCursor = sp+1;
    }
};

exports.moveToNextWord = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getCurrWordPos(p);
    //poses[1] is next word`s start position
    var sp = poses[1];
    if (sp) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp+1);
            this.visualCursor = sp+1;
        }
    }
};

exports.copyWord = function (p) {
    var poses = textUtil.getCurrWordPos(p);
    return poses[1];
};

exports.deleteWord = function () {
    var t;
    var poses = textUtil.getCurrWordPos();
    if (poses[1]) {
        t = textUtil.delete(poses[0], poses[1]);
        textUtil.select(poses[0], poses[0]+1)
    }
    return t;
};

exports.moveToPrevWord = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getPrevWordPos(p);
    var sp = poses[0];
    if (sp !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp);
            this.visualCursor = sp;
        }
    }
};

exports.moveToPrevBigWord = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getPrevBigWordPos(p);
    var sp = poses[0];
    if (sp !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp);
            this.visualCursor = sp;
        }
    }
};

exports.moveToPrevSentence = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getPrevSentencePos(p);
    var sp = poses[0];
    if (sp !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp);
            this.visualCursor = sp;
        }
    }
};

exports.moveToNextSentence = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getNextSentencePos(p);
    var sp = poses[0];
    if (sp !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp+1);
            this.visualCursor = sp+1;
        }
    }
};

exports.moveToPrevParagraph = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getPrevParagraphPos(p);
    var sp = poses[0];
    if (sp !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp);
            this.visualCursor = sp;
        }
    }
};

exports.moveToNextParagraph = function () {
    var p;
    if (this.isMode(VISUAL)) {
        p = this.visualCursor;
    }
    var poses = textUtil.getNextParagraphPos(p);
    var sp = poses[0];
    if (sp !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(sp, sp+1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, sp+1);
            this.visualCursor = sp+1;
        }
    }
};

exports.deletePrevWord = function () {
    var t;
    var p = textUtil.getCursorPosition();
    var poses = textUtil.getPrevWordPos(p);
    if (poses[0] !== undefined && poses[0] < p) {
        t = textUtil.delete(poses[0], p);
        textUtil.select(poses[0], poses[0]+1);
    }
    return t;
};

exports.copyPrevWord = function (p) {
    var poses = textUtil.getPrevWordPos(p);
    return poses[0];
};

exports.changeLine = function () {
    var sp = textUtil.getCurrLineStartPos();
    var ep = textUtil.getCurrLineEndPos();
    if (ep > sp) {
        var t = textUtil.delete(sp, ep);
        textUtil.select(sp, sp);
        return t;
    }
    textUtil.select(sp, sp);
    return '';
};

exports.changeToEnd = function () {
    var p = textUtil.getCursorPosition();
    var ep = textUtil.getCurrLineEndPos();
    if (ep > p) {
        var t = textUtil.delete(p, ep);
        textUtil.select(p, p);
        return t;
    }
    textUtil.select(p, p);
    return '';
};

exports.changeWord = function () {
    var t;
    var poses = textUtil.getCurrWordPos();
    if (poses[1]) {
        t = textUtil.delete(poses[0], poses[1]);
        textUtil.select(poses[0], poses[0]);
    }
    return t;
};

exports.changePrevWord = function () {
    var t;
    var p = textUtil.getCursorPosition();
    var poses = textUtil.getPrevWordPos(p);
    if (poses[0] !== undefined && poses[0] < p) {
        t = textUtil.delete(poses[0], p);
        textUtil.select(poses[0], poses[0]);
    }
    return t;
};

exports.substituteChar = function () {
    var p = textUtil.getCursorPosition();
    var t = this.deleteSelected();
    textUtil.select(p, p);
    this.pasteInNewLineRequest = false;
    return t;
};

// ==============================
// Find character motions (f/F/t/T)
// ==============================

// Helper: find char position forward on current line without moving cursor
exports._findForwardPos = function(char, count, p) {
    var ep = textUtil.getCurrLineEndPos(p);
    var text = textUtil.getText();
    var found = 0;
    for (var i = p + 1; i < ep; i++) {
        if (text.charAt(i) === char) {
            found++;
            if (found === count) {
                return i;
            }
        }
    }
    return undefined;
};

// Helper: find char position backward on current line without moving cursor
exports._findBackwardPos = function(char, count, p) {
    var sp = textUtil.getCurrLineStartPos(p);
    var text = textUtil.getText();
    var found = 0;
    for (var i = p - 1; i >= sp; i--) {
        if (text.charAt(i) === char) {
            found++;
            if (found === count) {
                return i;
            }
        }
    }
    return undefined;
};

// f{char} — move cursor to next occurrence of char on current line
exports.findCharForward = function(char, count) {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    var pos = this._findForwardPos(char, count, p);
    if (pos !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(pos, pos + 1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, pos + 1);
            this.visualCursor = pos + 1;
        }
        return pos;
    }
    return undefined;
};

// F{char} — move cursor to previous occurrence of char on current line
exports.findCharBackward = function(char, count) {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    var pos = this._findBackwardPos(char, count, p);
    if (pos !== undefined) {
        if (this.isMode(GENERAL)) {
            textUtil.select(pos, pos + 1);
        } else if (this.isMode(VISUAL)) {
            textUtil.select(this.visualPosition, pos);
            this.visualCursor = pos;
        }
        return pos;
    }
    return undefined;
};

// t{char} — move cursor to just before next occurrence of char on current line
exports.findCharTillForward = function(char, count) {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    var pos = this._findForwardPos(char, count, p);
    if (pos !== undefined) {
        var tp = pos - 1;
        if (tp >= p) {
            if (this.isMode(GENERAL)) {
                textUtil.select(tp, tp + 1);
            } else if (this.isMode(VISUAL)) {
                textUtil.select(this.visualPosition, tp + 1);
                this.visualCursor = tp + 1;
            }
            return tp;
        }
    }
    return undefined;
};

// T{char} — move cursor to just after previous occurrence of char on current line
exports.findCharTillBackward = function(char, count) {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    var pos = this._findBackwardPos(char, count, p);
    if (pos !== undefined) {
        var tp = pos + 1;
        if (tp <= p) {
            if (this.isMode(GENERAL)) {
                textUtil.select(tp, tp + 1);
            } else if (this.isMode(VISUAL)) {
                textUtil.select(this.visualPosition, tp);
                this.visualCursor = tp;
            }
            return tp;
        }
    }
    return undefined;
};

// ==============================
// Delete/yank with find char motions
// ==============================

// df{char} — delete from cursor through next occurrence of char
exports.deleteToFindForward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findForwardPos(char, count, sp);
    if (pos !== undefined) {
        var t = textUtil.delete(sp, pos + 1);
        textUtil.select(sp, sp + 1);
        return t;
    }
    return undefined;
};

// dF{char} — delete from cursor back through previous occurrence of char
exports.deleteToFindBackward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findBackwardPos(char, count, sp);
    if (pos !== undefined) {
        var t = textUtil.delete(pos, sp);
        textUtil.select(pos, pos + 1);
        return t;
    }
    return undefined;
};

// dt{char} — delete from cursor to just before next occurrence of char
exports.deleteToTillForward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findForwardPos(char, count, sp);
    if (pos !== undefined) {
        var t = textUtil.delete(sp, pos);
        textUtil.select(sp, sp + 1);
        return t;
    }
    return undefined;
};

// dT{char} — delete from cursor back to just after previous occurrence of char
exports.deleteToTillBackward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findBackwardPos(char, count, sp);
    if (pos !== undefined) {
        var t = textUtil.delete(pos + 1, sp);
        textUtil.select(pos + 1, pos + 2);
        return t;
    }
    return undefined;
};

// yf{char} — yank from cursor through next occurrence of char
exports.yankToFindForward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findForwardPos(char, count, sp);
    if (pos !== undefined) {
        this.pasteInNewLineRequest = false;
        return textUtil.getText(sp, pos + 1);
    }
    return undefined;
};

// yF{char} — yank from cursor back through previous occurrence of char
exports.yankToFindBackward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findBackwardPos(char, count, sp);
    if (pos !== undefined) {
        this.pasteInNewLineRequest = false;
        return textUtil.getText(pos, sp);
    }
    return undefined;
};

// yt{char} — yank from cursor to just before next occurrence of char
exports.yankToTillForward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findForwardPos(char, count, sp);
    if (pos !== undefined) {
        this.pasteInNewLineRequest = false;
        return textUtil.getText(sp, pos);
    }
    return undefined;
};

// yT{char} — yank from cursor back to just after previous occurrence of char
exports.yankToTillBackward = function(char, count) {
    var sp = textUtil.getCursorPosition();
    var pos = this._findBackwardPos(char, count, sp);
    if (pos !== undefined) {
        this.pasteInNewLineRequest = false;
        return textUtil.getText(pos + 1, sp);
    }
    return undefined;
};

// ==============================
// Word-end motions (e/E)
// ==============================

// e — move to end of current/next word
exports.moveToWordEnd = function() {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    var text = textUtil.getText();
    var len = text.length;
    var i = p + 1;

    // Skip whitespace
    while (i < len && /\s/.test(text.charAt(i))) {
        i++;
    }

    if (i >= len) return;

    // Determine character class and advance to end of class
    var ch = text.charAt(i);
    if (/[\w\u4e00-\u9fa5]/.test(ch)) {
        while (i + 1 < len && /[\w\u4e00-\u9fa5]/.test(text.charAt(i + 1))) {
            i++;
        }
    } else if (/\S/.test(ch)) {
        while (i + 1 < len && /\W/.test(text.charAt(i + 1)) && /\S/.test(text.charAt(i + 1))) {
            i++;
        }
    }

    if (this.isMode(GENERAL)) {
        textUtil.select(i, i + 1);
    } else if (this.isMode(VISUAL)) {
        textUtil.select(this.visualPosition, i + 1);
        this.visualCursor = i + 1;
    }
};

// E — move to end of current/next WORD (whitespace-delimited)
exports.moveToWordEndBig = function() {
    var p = textUtil.getCursorPosition();
    if (this.isMode(VISUAL) && this.visualCursor !== undefined) {
        p = this.visualCursor;
    }
    var text = textUtil.getText();
    var len = text.length;
    var i = p + 1;

    // Skip whitespace
    while (i < len && /\s/.test(text.charAt(i))) {
        i++;
    }

    if (i >= len) return;

    // Advance to end of non-whitespace sequence
    while (i + 1 < len && /\S/.test(text.charAt(i + 1))) {
        i++;
    }

    if (this.isMode(GENERAL)) {
        textUtil.select(i, i + 1);
    } else if (this.isMode(VISUAL)) {
        textUtil.select(this.visualPosition, i + 1);
        this.visualCursor = i + 1;
    }
};

// ==============================
// Text object range methods
// ==============================

// Helper: determine character class
// Returns 'word', 'symbol', or 'space'
exports._charClass = function(ch) {
    if (/[\w\u4e00-\u9fa5]/.test(ch)) return 'word';
    if (/\s/.test(ch)) return 'space';
    return 'symbol';
};

// iw — inner word: the word (or whitespace block) under the cursor
// Returns [start, end) range
exports.getInnerWordRange = function(p) {
    var text = textUtil.getText();
    var len = text.length;
    if (p < 0 || p >= len) return null;

    var ch = text.charAt(p);
    var cls = this._charClass(ch);

    // Expand backward while same class
    var start = p;
    while (start > 0 && this._charClass(text.charAt(start - 1)) === cls) {
        start--;
    }

    // Expand forward while same class
    var end = p + 1;
    while (end < len && this._charClass(text.charAt(end)) === cls) {
        end++;
    }

    return [start, end];
};

// aw — a word: word + surrounding whitespace
// If trailing whitespace exists, include it; otherwise include leading whitespace
// Returns [start, end) range
exports.getAWordRange = function(p) {
    var text = textUtil.getText();
    var len = text.length;
    if (p < 0 || p >= len) return null;

    var inner = this.getInnerWordRange(p);
    if (!inner) return null;
    var start = inner[0];
    var end = inner[1];

    // Try trailing whitespace first
    var trailEnd = end;
    while (trailEnd < len && /\s/.test(text.charAt(trailEnd))) {
        trailEnd++;
    }

    if (trailEnd > end) {
        return [start, trailEnd];
    }

    // No trailing whitespace — try leading whitespace
    var leadStart = start;
    while (leadStart > 0 && /\s/.test(text.charAt(leadStart - 1))) {
        leadStart--;
    }

    if (leadStart < start) {
        return [leadStart, end];
    }

    // No surrounding whitespace
    return [start, end];
};

// Inner quote range: find enclosing quotes around cursor position
// Returns [start, end) range where start is char after opening quote, end is closing quote position
exports.getInnerQuoteRange = function(p, quoteChar) {
    var text = textUtil.getText();
    var len = text.length;
    if (p < 0 || p >= len) return null;

    var openPos = -1;
    var closePos = -1;

    // Strategy: find all quote positions on this "line" (or full text for simplicity),
    // then determine which pair encloses the cursor.
    // Collect all quote positions
    var quotes = [];
    for (var i = 0; i < len; i++) {
        if (text.charAt(i) === quoteChar) {
            quotes.push(i);
        }
    }

    // Find the pair that encloses p
    // Quotes pair up as (0,1), (2,3), (4,5), etc.
    for (var j = 0; j < quotes.length - 1; j += 2) {
        var qOpen = quotes[j];
        var qClose = quotes[j + 1];
        if (p >= qOpen && p <= qClose) {
            openPos = qOpen;
            closePos = qClose;
            break;
        }
    }

    if (openPos === -1 || closePos === -1) return null;
    if (closePos - openPos <= 1) return null; // empty quotes — nothing to delete

    return [openPos + 1, closePos];
};

// A quote range: including the quotes themselves
exports.getAQuoteRange = function(p, quoteChar) {
    var text = textUtil.getText();
    var len = text.length;
    if (p < 0 || p >= len) return null;

    var quotes = [];
    for (var i = 0; i < len; i++) {
        if (text.charAt(i) === quoteChar) {
            quotes.push(i);
        }
    }

    for (var j = 0; j < quotes.length - 1; j += 2) {
        var qOpen = quotes[j];
        var qClose = quotes[j + 1];
        if (p >= qOpen && p <= qClose) {
            return [qOpen, qClose + 1];
        }
    }

    return null;
};

// Inner pair range: find matching pair delimiters (parens, braces, brackets)
// Handles nesting properly
exports.getInnerPairRange = function(p, openChar, closeChar) {
    var text = textUtil.getText();
    var len = text.length;
    if (p < 0 || p >= len) return null;

    // Find the opening delimiter by scanning backward, counting nesting
    var openPos = -1;
    var depth = 0;

    // If cursor is on the closing delimiter, start scanning from just before it
    var scanStart = p;
    if (text.charAt(p) === closeChar && openChar !== closeChar) {
        scanStart = p - 1;
        // We found the close, now find its matching open
        depth = 0;
        for (var i = scanStart; i >= 0; i--) {
            if (text.charAt(i) === closeChar) {
                depth++;
            } else if (text.charAt(i) === openChar) {
                if (depth === 0) {
                    openPos = i;
                    break;
                }
                depth--;
            }
        }
        if (openPos !== -1) {
            if (p - openPos <= 1) return null;
            return [openPos + 1, p];
        }
        return null;
    }

    // If cursor is on the opening delimiter, find matching close
    if (text.charAt(p) === openChar && openChar !== closeChar) {
        depth = 0;
        for (var i = p + 1; i < len; i++) {
            if (text.charAt(i) === openChar) {
                depth++;
            } else if (text.charAt(i) === closeChar) {
                if (depth === 0) {
                    if (i - p <= 1) return null;
                    return [p + 1, i];
                }
                depth--;
            }
        }
        return null;
    }

    // General case: scan backward for opening, then forward for closing
    depth = 0;
    for (var i = p; i >= 0; i--) {
        if (text.charAt(i) === closeChar && i !== p && openChar !== closeChar) {
            depth++;
        } else if (text.charAt(i) === openChar) {
            if (depth === 0) {
                openPos = i;
                break;
            }
            depth--;
        }
    }

    if (openPos === -1) return null;

    // Now find matching close from after openPos
    depth = 0;
    var closePos = -1;
    for (var i = openPos + 1; i < len; i++) {
        if (text.charAt(i) === openChar) {
            depth++;
        } else if (text.charAt(i) === closeChar) {
            if (depth === 0) {
                closePos = i;
                break;
            }
            depth--;
        }
    }

    if (closePos === -1) return null;
    if (closePos - openPos <= 1) return null;

    return [openPos + 1, closePos];
};

// A pair range: including the delimiters themselves
exports.getAPairRange = function(p, openChar, closeChar) {
    var inner = this.getInnerPairRange(p, openChar, closeChar);
    if (!inner) return null;
    // inner[0] is openPos + 1, inner[1] is closePos
    return [inner[0] - 1, inner[1] + 1];
};

// ==============================
// Search motions (/, ?, n, N, *, #)
// ==============================

// Search forward for query from current cursor position
exports.searchForward = function(query) {
    var p = textUtil.getCursorPosition();
    var pos = textUtil.findNext(query, p);
    if (pos !== undefined) {
        textUtil.select(pos, pos + 1);
        return pos;
    }
    return undefined;
};

// Search backward for query from current cursor position
exports.searchBackward = function(query) {
    var p = textUtil.getCursorPosition();
    var pos = textUtil.findPrev(query, p);
    if (pos !== undefined) {
        textUtil.select(pos, pos + 1);
        return pos;
    }
    return undefined;
};
