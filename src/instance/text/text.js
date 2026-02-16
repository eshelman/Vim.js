/**
 * Created by top on 15-9-6.
 */
const _ENTER_ = '\n';
var el;

exports._init = function (element) {
    el = element;
}

exports.setEle = function(e){
    el = e;
}

exports.getText = function(sp, ep) {
    if (sp !== undefined || ep !== undefined) {
        return el.value.slice(sp, ep);
    }
    return el.value;
};

exports.setText = function (t) {
    el.value = t;
};

exports.getSelectedText = function() {
    var t = el.value.substring(el.selectionStart, el.selectionEnd);
    return t + '';
};

exports.getCursorPosition = function () {
    return el.selectionStart;
};

exports.getSelectEndPos = function () {
    return el.selectionEnd;
};

exports.select = function (start, end) {
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

exports.appendText = function (t, p, paste, isNewLine) {
    var ot = this.getText();
    if (p === undefined) {
        p = this.getCursorPosition() + 1;
    }
    var nt = ot.slice(0, p) + t + ot.slice(p, ot.length);
    this.setText(nt);
    if (paste) {
        if (isNewLine && p) {
            this.select(p+1, p+2);
        } else {
            this.select(p+t.length, p+t.length-1);
        }
    } else {
        this.select(p, p + t.length);
    }
};

exports.insertText = function (t, p, paste, isNewLine) {
    var ot = this.getText();
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var nt = ot.slice(0, p) + t + ot.slice(p, ot.length);
    this.setText(nt);
    if (paste) {
        if (isNewLine) {
            this.select(p, p+1);
        } else {
            this.select(p+t.length, p+t.length-1);
        }
    } else {
        this.select(p, p + t.length);
    }
};

exports.delete = function (sp, ep) {
    if (sp > ep) {
        var p = ep;
        sp = ep;
        ep = p;
    }
    if (ep - sp > 0) {
        var t = this.getText();
        var nt = t.slice(0, sp) + t.slice(ep);
        if (!nt) {
            nt = ' ';
        }
        this.setText(nt);
        return t.slice(sp, ep);
    }
    return undefined;
};

exports.delSelected = function () {
    var sp = this.getCursorPosition();
    var ep = this.getSelectEndPos();
    return this.delete(sp, ep);
};

exports.getCountFromStartToPosInCurrLine = function(p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var s = this.getCurrLineStartPos(p);
    return (p - s) + 1;
};

exports.getCurrLineStartPos = function (p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var sp = this.findSymbolBefore(p, _ENTER_);
    return sp || 0;
};

exports.getCurrLineEndPos = function (p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    if (this.getSymbol(p) === _ENTER_) {
        return p;
    }
    var end = this.findSymbolAfter(p, _ENTER_);
    return end || this.getText().length;
};

exports.getCurrLineCount = function (p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var left = this.findSymbolBefore(p, _ENTER_);
    var right = this.findSymbolAfter(p, _ENTER_);
    if (left === undefined) {
        return right;
    }
    return right - left;
};

exports.getNextLineStart = function (p) {
    var sp = this.getCurrLineStartPos(p);
    var cc = this.getCurrLineCount(p);
    return sp + cc + 1;
};

exports.getNextLineEnd = function (p) {
    var start = this.getNextLineStart(p);
    if (start !== undefined) {
        var end = this.findSymbolAfter(start, _ENTER_);
        return end || this.getText().length;
    }
    return undefined;
};

exports.getPrevLineEnd = function (pos) {
    var p = this.getCurrLineStartPos(pos);
    if (p > 0) {
        return p - 1;
    }
    return undefined;
};

exports.getPrevLineStart = function (pos) {
   var p = this.getPrevLineEnd(pos);
   if (p !== undefined) {
       var sp = this.findSymbolBefore(p, _ENTER_);
       return sp || 0;
   }
   return undefined;
};

exports.findSymbolBefore = function (p, char) {
    var text = this.getText();
    for (var i = (p-1); i>=0; i--) {
        if (text.charAt(i) === char) {
            return i+1;
        }
    }
    return 0;
};

exports.findSymbolAfter = function (p, char, char2) {
    var text = this.getText();
    var pattern = new RegExp(char);
    //And conditions
    var andPattern = char2 ? new RegExp(char2) : false;
    for (var i = p; i<text.length; i++) {
        if (pattern.test(text.charAt(i))) {
            if (!andPattern) {
                return i;
            } else if (andPattern.test(text.charAt(i))) {
                return i;
            }
        }
    }
    return this.getText().length;
};

exports.getSymbol = function (p) {
    var text = this.getText();
    return text.charAt(p) || undefined;
};

exports.getNextSymbol = function (p) {
    return this.getSymbol(p+1);
};

exports.getPrevSymbol = function (p) {
    return this.getSymbol(p-1);
};

exports.getCurrWordPos = function (p) {
    p = p || this.getCursorPosition();
    //current character
    var char = this.getSymbol(p);

    //parse current character type
    //
    var patternStr;
    if (/[\w\u4e00-\u9fa5]/.test(char) && /[^\|]/.test(char)) {
        //this char is a general character(such as a-z,0-9,_, etc),
        //and should find symbol character(such as *&^%$|{(, etc).
        //
        //pattern string for find symbol char:
        patternStr = "[^\\w\u4e00-\u9fa5]";
    } else if (/\W/.test(char) && /\S/.test(char)) {
        //this char is a symbol character(such as *&^%$, etc),
        //and should find general character(such as a-z,0-9,_, etc).
        //
        //pattern string for find general char:
        patternStr = "[\\w\u4e00-\u9fa5]";
    }

    //parse and get current word`s last character`s right position,
    //and in other word, get the next word`s first character`s left position
    //
    var lastCharPos;
    if (patternStr) {
        //get first invisible character position
        var firstInvisible = this.findSymbolAfter(p, '\\s');
        //get first visible character which after first invisible space
        var firstVisible = this.findSymbolAfter(firstInvisible, '\\S');
        //get position
        lastCharPos = this.findSymbolAfter(p, patternStr, '\\S');
        lastCharPos = lastCharPos - p < firstInvisible - p ? lastCharPos : firstVisible;
    } else {
        //get any visible symbol`s position
        lastCharPos = this.findSymbolAfter(p, '\\S');
    }

    //return current word`s start position and end position
    //
    if (lastCharPos < this.getText().length) {
        return [p, lastCharPos];
    }
    return [p, undefined];
};

exports.getPrevWordPos = function (p) {
    p = p || this.getCursorPosition();
    var text = this.getText();

    var i = p - 1;
    if (i < 0) return [0, undefined];

    // Skip whitespace backward
    while (i > 0 && /\s/.test(text.charAt(i))) {
        i--;
    }

    // Identify character class and scan backward while same class
    var char = text.charAt(i);
    if (/[\w\u4e00-\u9fa5]/.test(char)) {
        while (i > 0 && /[\w\u4e00-\u9fa5]/.test(text.charAt(i - 1))) {
            i--;
        }
    } else if (/\S/.test(char)) {
        while (i > 0 && /\W/.test(text.charAt(i - 1)) && /\S/.test(text.charAt(i - 1))) {
            i--;
        }
    }

    return [i, undefined];
};

exports.getPrevBigWordPos = function (p) {
    p = p || this.getCursorPosition();
    var text = this.getText();

    var i = p - 1;
    if (i < 0) return [0, undefined];

    // Skip whitespace backward
    while (i > 0 && /\s/.test(text.charAt(i))) {
        i--;
    }

    // Scan backward while non-whitespace
    while (i > 0 && /\S/.test(text.charAt(i - 1))) {
        i--;
    }

    return [i, undefined];
};

exports.getPrevSentencePos = function (p) {
    p = p || this.getCursorPosition();
    var text = this.getText();
    if (p <= 0) return [0, undefined];

    var i = p - 1;

    // Skip whitespace backward
    while (i > 0 && /\s/.test(text.charAt(i))) {
        i--;
    }

    // Skip past sentence terminator at current boundary so we find the previous one
    // A sentence terminator is .!? followed by whitespace or end-of-text
    if (i > 0 && /[.!?]/.test(text.charAt(i)) && (i + 1 >= text.length || /\s/.test(text.charAt(i + 1)))) {
        i--;
    }

    // Skip whitespace again after skipping terminator
    while (i > 0 && /\s/.test(text.charAt(i))) {
        i--;
    }

    // Scan backward for sentence terminator (.!? followed by whitespace/EOT) or blank line (\n\n)
    while (i > 0) {
        if (/[.!?]/.test(text.charAt(i)) && (i + 1 >= text.length || /\s/.test(text.charAt(i + 1)))) {
            // Found sentence terminator, skip whitespace forward to next sentence start
            var j = i + 1;
            while (j < text.length && /\s/.test(text.charAt(j))) {
                j++;
            }
            return [j, undefined];
        }
        if (text.charAt(i) === '\n' && i > 0 && text.charAt(i - 1) === '\n') {
            // Blank line boundary
            var j = i + 1;
            while (j < text.length && /\s/.test(text.charAt(j))) {
                j++;
            }
            return [j, undefined];
        }
        i--;
    }

    return [0, undefined];
};

exports.getNextSentencePos = function (p) {
    p = p || this.getCursorPosition();
    var text = this.getText();
    var len = text.length;
    if (p >= len - 1) return [len - 1, undefined];

    var i = p;

    // Scan forward for sentence terminator (.!? followed by whitespace/EOT) or blank line
    while (i < len) {
        if (/[.!?]/.test(text.charAt(i)) && (i + 1 >= len || /\s/.test(text.charAt(i + 1)))) {
            // Skip whitespace to find next sentence start
            i++;
            while (i < len && /\s/.test(text.charAt(i))) {
                i++;
            }
            if (i < len) {
                return [i, undefined];
            }
            return [len - 1, undefined];
        }
        if (i < len - 1 && text.charAt(i) === '\n' && text.charAt(i + 1) === '\n') {
            // Blank line boundary
            i += 2;
            while (i < len && /\s/.test(text.charAt(i))) {
                i++;
            }
            if (i < len) {
                return [i, undefined];
            }
            return [len - 1, undefined];
        }
        i++;
    }

    return [len - 1, undefined];
};

exports.getPrevParagraphPos = function (p) {
    p = p || this.getCursorPosition();
    var text = this.getText();
    if (p <= 0) return [0, undefined];

    var i = p - 1;

    // Skip consecutive newlines at current position
    while (i > 0 && text.charAt(i) === '\n') {
        i--;
    }

    // Scan backward for blank line (\n\n)
    while (i > 0) {
        if (text.charAt(i) === '\n' && text.charAt(i - 1) === '\n') {
            return [i, undefined];
        }
        i--;
    }

    return [0, undefined];
};

exports.getNextParagraphPos = function (p) {
    p = p || this.getCursorPosition();
    var text = this.getText();
    var len = text.length;
    if (p >= len - 1) return [len - 1, undefined];

    var i = p + 1;

    // Skip consecutive newlines at current position
    while (i < len - 1 && text.charAt(i) === '\n') {
        i++;
    }

    // Scan forward for blank line (\n\n)
    while (i < len - 1) {
        if (text.charAt(i) === '\n' && text.charAt(i + 1) === '\n') {
            return [i + 1, undefined];
        }
        i++;
    }

    return [len - 1, undefined];
};

// ==============================
// Search methods
// ==============================

// Find next occurrence of string after position p, wrapping around
exports.findNext = function(query, p) {
    var text = this.getText();
    var idx = text.indexOf(query, p + 1);
    if (idx === -1) {
        // Wrap around to beginning
        idx = text.indexOf(query, 0);
    }
    // If the only match is at the current position, treat as no match
    if (idx === p) {
        return undefined;
    }
    return idx === -1 ? undefined : idx;
};

// Find previous occurrence of string before position p, wrapping around
exports.findPrev = function(query, p) {
    var text = this.getText();
    var idx = -1;
    if (p - 1 >= 0) {
        idx = text.lastIndexOf(query, p - 1);
    }
    if (idx === -1) {
        // Wrap around to end
        idx = text.lastIndexOf(query, text.length);
    }
    // If the only match is at the current position, treat as no match
    if (idx === p) {
        return undefined;
    }
    return idx === -1 ? undefined : idx;
};

// Get word under cursor (for * and #)
exports.getWordUnderCursor = function(p) {
    if (p === undefined) p = this.getCursorPosition();
    var text = this.getText();
    if (!text.length) return undefined;
    var ch = text.charAt(p);
    if (!/[\w\u4e00-\u9fa5]/.test(ch)) return undefined;
    var start = p, end = p;
    while (start > 0 && /[\w\u4e00-\u9fa5]/.test(text.charAt(start - 1))) start--;
    while (end < text.length - 1 && /[\w\u4e00-\u9fa5]/.test(text.charAt(end + 1))) end++;
    return text.substring(start, end + 1);
};
