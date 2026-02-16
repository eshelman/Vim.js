/**
 * Created by top on 15-9-6.
 */
const GENERAL = 'general_mode';
const COMMAND = 'command_mode';
const EDIT    = 'edit_mode';
const VISUAL  = 'visual_mode';
const _ENTER_ = '\n';

var App;
var vim;
var textUtil;
var _timeoutIds = [];

exports._init = function (app) {
    App = app;
    vim = app.vim;
    textUtil = app.textUtil;
}

exports.setVim = function(v) {
    vim = v;
}

exports.setTextUtil = function(tu) {
    textUtil = tu;
}

exports.selectPrevCharacter = function (num) {
    App.repeatAction(function(){
        vim.selectPrevCharacter();
    }, num);
};

exports.selectNextCharacter = function (num) {
    App.repeatAction(function(){
        vim.selectNextCharacter();
    }, num);
};

exports.switchModeToGeneral = function () {
    App.endEditCapture();
    var cMode= vim.currentMode;
    if (vim.isMode(GENERAL)) {
        return;
    }
    vim.switchModeTo(GENERAL);
    var p = textUtil.getCursorPosition();
    var sp = textUtil.getCurrLineStartPos();
    if (p === sp) {
        var c = textUtil.getCurrLineCount();
        if (!c) {
            textUtil.appendText(' ', p);
        }
        vim.selectNextCharacter();
        vim.selectPrevCharacter();
        if (textUtil.getCurrLineCount() === 1) {
            textUtil.select(p, p+1);
        }
    } else {
        if (cMode === VISUAL) {
            vim.selectNextCharacter();
        }
        vim.selectPrevCharacter();
    }
};

exports.switchModeToVisual = function () {
    if (vim.isMode(VISUAL)) {
        var s = vim.visualCursor;
        if (s === undefined) {
            return;
        }
        var p = vim.visualPosition;
        if (p < s) {
            textUtil.select(s-1, s);
        } else {
            textUtil.select(s, s+1);
        }
        if (textUtil.getPrevSymbol(s) === _ENTER_) {
            textUtil.select(s, s+1);
        }
        vim.switchModeTo(GENERAL);
        return;
    }
    vim.switchModeTo(VISUAL);
    vim.visualPosition = textUtil.getCursorPosition();
    vim.visualCursor = undefined;
};

exports.append = function() {
    vim.append();
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.appendLineTail = function () {
    vim.moveToCurrentLineTail();
    this.append();
};

exports.insert = function() {
    vim.insert();
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.insertLineHead = function () {
    vim.moveToCurrentLineHead();
    this.insert();
};

exports.selectNextLine = function (num) {
    App.repeatAction(function(){
        vim.selectNextLine();
    }, num);
};

exports.selectPrevLine = function (num) {
    App.repeatAction(function(){
        vim.selectPrevLine();
    }, num);
};

exports.copyChar = function() {
    vim.pasteInNewLineRequest = false;
    App.clipboard = textUtil.getSelectedText();
    if (vim.isMode(VISUAL)) {
        this.switchModeToGeneral();
    }
};

exports.copyCurrentLine = function(num) {
    var _data = {p:undefined, t:''};
    App.repeatAction(function () {
        _data.t = vim.copyCurrentLine(_data.p);
        _data.p = textUtil.getNextLineStart(_data.p);
        return _data.t;
    }, num);
};

exports.pasteAfter = function () {
    if (App.clipboard !== undefined) {
        if(vim.pasteInNewLineRequest){
            var ep = textUtil.getCurrLineEndPos();
            textUtil.appendText(_ENTER_ + App.clipboard, ep, true, true);
        } else {
            textUtil.appendText(App.clipboard, undefined, true, false)
        }
    }
};

exports.pasteBefore = function () {
    if (App.clipboard !== undefined) {
        if(vim.pasteInNewLineRequest){
            var sp = textUtil.getCurrLineStartPos();
            textUtil.insertText(App.clipboard + _ENTER_, sp, true, true);
        } else {
            textUtil.insertText(App.clipboard, undefined, true, false)
        }
    }
};

exports.moveToCurrentLineHead = function () {
    vim.moveToCurrentLineHead();
};

exports.moveToCurrentLineTail = function () {
    vim.moveToCurrentLineTail();
};

exports.replaceChar = function () {
    vim.replaceRequest = true;
};

exports.appendNewLine = function () {
    vim.appendNewLine();
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.insertNewLine = function () {
    vim.insertNewLine();
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.delCharAfter = function (num) {
    App.repeatAction(function(){
       return vim.deleteSelected();
    }, num);
    this.switchModeToGeneral()
};

exports.backToHistory = function () {
    var key = App.getEleKey();
    var list = App.doList[key];
    if (list && list.length) {
        // Save current state to redo stack before restoring
        App.recordRedo(App.textUtil.getText(), App.textUtil.getCursorPosition());
        vim.backToHistory(list);
    }
};

exports.redo = function () {
    var key = App.getEleKey();
    var redoList = App.redoList[key];
    if (redoList && redoList.length) {
        // Save current state to undo stack directly (bypass clearRedo)
        var t = App.textUtil.getText();
        var p = App.textUtil.getCursorPosition();
        if (!App.doList[key]) {
            App.doList[key] = [];
        }
        if (App.doList[key].length >= App.doListDeep) {
            App.doList[key].shift();
        }
        App.doList[key].push({ 't': t, 'p': p });
        // Restore from redo
        var data = redoList.pop();
        textUtil.setText(data.t);
        textUtil.select(data.p, data.p + 1);
    }
};

exports.delCurrLine = function (num) {
    App.repeatAction(function () {
       return vim.delCurrLine();
    }, num);
};

exports.moveToFirstLine = function () {
    vim.moveToFirstLine();
};

exports.moveToLastLine = function () {
    vim.moveToLastLine();
};

exports.moveToNextWord = function (num) {
    App.repeatAction(function(){
        vim.moveToNextWord();
    }, num);
};

exports.copyWord = function (num) {
    vim.pasteInNewLineRequest = false;
    var sp = textUtil.getCursorPosition();
    var ep;
    App.repeatAction(function(){
        ep = vim.copyWord(ep);
    }, num);
    App.clipboard = textUtil.getText(sp,ep);
};

exports.deleteWord = function (num) {
    vim.pasteInNewLineRequest = false;
    App.repeatAction(function () {
       return vim.deleteWord();
    }, num);
};

exports.moveToPrevWord = function (num) {
    App.repeatAction(function(){
        vim.moveToPrevWord();
    }, num);
};

exports.moveToPrevBigWord = function (num) {
    App.repeatAction(function(){
        vim.moveToPrevBigWord();
    }, num);
};

exports.moveToPrevSentence = function (num) {
    App.repeatAction(function(){
        vim.moveToPrevSentence();
    }, num);
};

exports.moveToNextSentence = function (num) {
    App.repeatAction(function(){
        vim.moveToNextSentence();
    }, num);
};

exports.moveToPrevParagraph = function (num) {
    App.repeatAction(function(){
        vim.moveToPrevParagraph();
    }, num);
};

exports.moveToNextParagraph = function (num) {
    App.repeatAction(function(){
        vim.moveToNextParagraph();
    }, num);
};

exports.deletePrevWord = function (num) {
    vim.pasteInNewLineRequest = false;
    App.repeatAction(function () {
       return vim.deletePrevWord();
    }, num);
};

exports.changeLine = function (num) {
    App.repeatAction(function () {
       return vim.changeLine();
    }, num);
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.changeWord = function (num) {
    vim.pasteInNewLineRequest = false;
    App.repeatAction(function () {
       return vim.changeWord();
    }, num);
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.changePrevWord = function (num) {
    vim.pasteInNewLineRequest = false;
    App.repeatAction(function () {
       return vim.changePrevWord();
    }, num);
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.changeToEnd = function () {
    vim.changeToEnd();
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.substitute = function (num) {
    vim.pasteInNewLineRequest = false;
    App.repeatAction(function () {
       return vim.substituteChar();
    }, num);
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.substituteLine = function (num) {
    this.changeLine(num);
};

exports.changeSelection = function () {
    if (!vim.isMode(VISUAL)) {
        return;
    }
    vim.pasteInNewLineRequest = false;
    App.clipboard = textUtil.getSelectedText();
    var p = textUtil.getCursorPosition();
    textUtil.delSelected();
    textUtil.select(p, p);
    App.startEditCapture();
    _timeoutIds.push(setTimeout(function () {
        vim.switchModeTo(EDIT);
    }, 100));
};

exports.copyPrevWord = function (num) {
    vim.pasteInNewLineRequest = false;
    var ep = textUtil.getCursorPosition();
    var sp;
    App.repeatAction(function(){
        sp = vim.copyPrevWord(sp);
    }, num);
    App.clipboard = textUtil.getText(sp, ep);
};

exports.dotRepeat = function (num) {
    var cmd = App._lastDotCommand;
    if (!cmd) {
        return;
    }
    var repeatNum = num || cmd.num;
    //record for undo if the original command was recordable or had inserted text
    if (cmd.isRecordable || cmd.insertedText !== undefined) {
        App.recordText();
    }
    //execute the command
    if (typeof exports[cmd.methodName] === 'function') {
        exports[cmd.methodName](repeatNum);
    }
    //if the command entered edit mode and has captured inserted text,
    //insert that text and return to normal mode
    if (cmd.insertedText !== undefined && cmd.insertedText !== '') {
        _timeoutIds.push(setTimeout(function () {
            if (vim.isMode(EDIT)) {
                var p = textUtil.getCursorPosition();
                textUtil.insertText(cmd.insertedText, p);
                textUtil.select(p + cmd.insertedText.length, p + cmd.insertedText.length);
                vim.switchModeTo(GENERAL);
                //reposition cursor in general mode (select character before cursor)
                var newP = textUtil.getCursorPosition();
                if (newP > 0) {
                    textUtil.select(newP - 1, newP);
                }
            }
        }, 200));
    }
};

// ==============================
// Find character motions (f/F/t/T)
// ==============================

// f — set pending request to find char forward
exports.findForward = function (num) {
    vim.findCharRequest = { type: 'f', count: num || 1 };
};

// F — set pending request to find char backward
exports.findBackward = function (num) {
    vim.findCharRequest = { type: 'F', count: num || 1 };
};

// t — set pending request to find till forward
exports.tillForward = function (num) {
    vim.findCharRequest = { type: 't', count: num || 1 };
};

// T — set pending request to find till backward
exports.tillBackward = function (num) {
    vim.findCharRequest = { type: 'T', count: num || 1 };
};

// Execute find after receiving the target character (standalone motion)
exports.executeFindChar = function (char, request) {
    // Store for ; and , repeat
    App._lastFindChar = { char: char, type: request.type, count: request.count };

    if (request.type === 'f') {
        vim.findCharForward(char, request.count);
    } else if (request.type === 'F') {
        vim.findCharBackward(char, request.count);
    } else if (request.type === 't') {
        vim.findCharTillForward(char, request.count);
    } else if (request.type === 'T') {
        vim.findCharTillBackward(char, request.count);
    }
};

// Execute find for operator-pending mode (df, dt, yf, yt, etc.)
exports.executeOperatorFindChar = function (char, request) {
    App._lastFindChar = { char: char, type: request.type, count: request.count };

    var operator = request.operator;
    var type = request.type;

    if (operator === 'd') {
        if (type === 'f') {
            vim.deleteToFindForward(char, request.count);
        } else if (type === 'F') {
            vim.deleteToFindBackward(char, request.count);
        } else if (type === 't') {
            vim.deleteToTillForward(char, request.count);
        } else if (type === 'T') {
            vim.deleteToTillBackward(char, request.count);
        }
    } else if (operator === 'y') {
        var text;
        if (type === 'f') {
            text = vim.yankToFindForward(char, request.count);
        } else if (type === 'F') {
            text = vim.yankToFindBackward(char, request.count);
        } else if (type === 't') {
            text = vim.yankToTillForward(char, request.count);
        } else if (type === 'T') {
            text = vim.yankToTillBackward(char, request.count);
        }
        if (text !== undefined) {
            App.clipboard = text;
        }
    }
};

// ==============================
// Operator-pending find char (df, dt, dF, dT, yf, yt, yF, yT)
// ==============================

exports.deleteFindForward = function (num) {
    vim.findCharRequest = { type: 'f', count: num || 1, operator: 'd' };
};

exports.deleteFindBackward = function (num) {
    vim.findCharRequest = { type: 'F', count: num || 1, operator: 'd' };
};

exports.deleteTillForward = function (num) {
    vim.findCharRequest = { type: 't', count: num || 1, operator: 'd' };
};

exports.deleteTillBackward = function (num) {
    vim.findCharRequest = { type: 'T', count: num || 1, operator: 'd' };
};

exports.yankFindForward = function (num) {
    vim.findCharRequest = { type: 'f', count: num || 1, operator: 'y' };
};

exports.yankFindBackward = function (num) {
    vim.findCharRequest = { type: 'F', count: num || 1, operator: 'y' };
};

exports.yankTillForward = function (num) {
    vim.findCharRequest = { type: 't', count: num || 1, operator: 'y' };
};

exports.yankTillBackward = function (num) {
    vim.findCharRequest = { type: 'T', count: num || 1, operator: 'y' };
};

// ==============================
// Repeat find motions (; and ,)
// ==============================

// ; — repeat last f/F/t/T in same direction
exports.repeatFindForward = function (num) {
    var last = App._lastFindChar;
    if (!last) return;
    var count = num || 1;
    if (last.type === 'f') {
        vim.findCharForward(last.char, count);
    } else if (last.type === 'F') {
        vim.findCharBackward(last.char, count);
    } else if (last.type === 't') {
        vim.findCharTillForward(last.char, count);
    } else if (last.type === 'T') {
        vim.findCharTillBackward(last.char, count);
    }
};

// , — repeat last f/F/t/T in opposite direction
exports.repeatFindBackward = function (num) {
    var last = App._lastFindChar;
    if (!last) return;
    var count = num || 1;
    // Reverse the direction
    if (last.type === 'f') {
        vim.findCharBackward(last.char, count);
    } else if (last.type === 'F') {
        vim.findCharForward(last.char, count);
    } else if (last.type === 't') {
        vim.findCharTillBackward(last.char, count);
    } else if (last.type === 'T') {
        vim.findCharTillForward(last.char, count);
    }
};

// ==============================
// Word-end motions (e/E)
// ==============================

exports.moveToWordEnd = function (num) {
    App.repeatAction(function(){
        vim.moveToWordEnd();
    }, num);
};

exports.moveToWordEndBig = function (num) {
    App.repeatAction(function(){
        vim.moveToWordEndBig();
    }, num);
};

// ==============================
// Text object pending state setters (called from parseRoute via compound keys)
// ==============================

exports.deleteInnerObject = function (num) {
    vim.textObjectRequest = { operator: 'd', type: 'inner', count: num || 1 };
};

exports.deleteAObject = function (num) {
    vim.textObjectRequest = { operator: 'd', type: 'a', count: num || 1 };
};

exports.yankInnerObject = function (num) {
    vim.textObjectRequest = { operator: 'y', type: 'inner', count: num || 1 };
};

exports.yankAObject = function (num) {
    vim.textObjectRequest = { operator: 'y', type: 'a', count: num || 1 };
};

exports.changeInnerObject = function (num) {
    vim.textObjectRequest = { operator: 'c', type: 'inner', count: num || 1 };
};

exports.changeAObject = function (num) {
    vim.textObjectRequest = { operator: 'c', type: 'a', count: num || 1 };
};

// ==============================
// Text object execution (called after receiving the specifier character)
// ==============================

// Normalize pair characters: ) maps to (, } maps to {, ] maps to [
var _pairMap = {
    '(': ['(', ')'],
    ')': ['(', ')'],
    '{': ['{', '}'],
    '}': ['{', '}'],
    '[': ['[', ']'],
    ']': ['[', ']'],
};

exports.executeTextObject = function (specifierChar, request) {
    var p = textUtil.getCursorPosition();
    var operator = request.operator;
    var type = request.type;  // 'inner' or 'a'
    var range = null;

    if (specifierChar === 'w') {
        // Word text object
        if (type === 'inner') {
            range = vim.getInnerWordRange(p);
        } else {
            range = vim.getAWordRange(p);
        }
    } else if (specifierChar === '"' || specifierChar === "'") {
        // Quote text object
        if (type === 'inner') {
            range = vim.getInnerQuoteRange(p, specifierChar);
        } else {
            range = vim.getAQuoteRange(p, specifierChar);
        }
    } else if (_pairMap[specifierChar]) {
        // Pair text object (parens, braces, brackets)
        var pair = _pairMap[specifierChar];
        if (type === 'inner') {
            range = vim.getInnerPairRange(p, pair[0], pair[1]);
        } else {
            range = vim.getAPairRange(p, pair[0], pair[1]);
        }
    }

    if (!range) return;

    var start = range[0];
    var end = range[1];

    if (operator === 'd') {
        // Delete the range
        vim.pasteInNewLineRequest = false;
        App.clipboard = textUtil.getText(start, end);
        textUtil.delete(start, end);
        textUtil.select(start, start + 1);
    } else if (operator === 'y') {
        // Yank the range (no text modification)
        vim.pasteInNewLineRequest = false;
        App.clipboard = textUtil.getText(start, end);
    } else if (operator === 'c') {
        // Change: delete the range and enter edit mode
        vim.pasteInNewLineRequest = false;
        App.clipboard = textUtil.getText(start, end);
        textUtil.delete(start, end);
        textUtil.select(start, start);
        App.startEditCapture();
        _timeoutIds.push(setTimeout(function () {
            vim.switchModeTo(EDIT);
        }, 100));
    }
};

// ==============================
// Search commands (/, ?, n, N, *, #)
// ==============================

// / — enter search-forward pending state
exports.searchForward = function() {
    App.searchRequest = { direction: 1 };
};

// ? — enter search-backward pending state
exports.searchBackward = function() {
    App.searchRequest = { direction: -1 };
};

// Execute a search (called programmatically or after user types query + Enter)
exports.executeSearch = function(query, direction) {
    App._searchState = { query: query, direction: direction };
    if (direction === 1) {
        vim.searchForward(query);
    } else {
        vim.searchBackward(query);
    }
};

// n — repeat last search in same direction
exports.searchNext = function(num) {
    var state = App._searchState;
    if (!state || !state.query) return;
    App.repeatAction(function() {
        if (state.direction === 1) {
            vim.searchForward(state.query);
        } else {
            vim.searchBackward(state.query);
        }
    }, num);
};

// N — repeat last search in opposite direction
exports.searchPrev = function(num) {
    var state = App._searchState;
    if (!state || !state.query) return;
    App.repeatAction(function() {
        if (state.direction === -1) {
            vim.searchForward(state.query);
        } else {
            vim.searchBackward(state.query);
        }
    }, num);
};

// * — search forward for word under cursor
exports.searchWordForward = function() {
    var word = textUtil.getWordUnderCursor();
    if (word) {
        App._searchState = { query: word, direction: 1 };
        vim.searchForward(word);
    }
};

// # — search backward for word under cursor
exports.searchWordBackward = function() {
    var word = textUtil.getWordUnderCursor();
    if (word) {
        App._searchState = { query: word, direction: -1 };
        vim.searchBackward(word);
    }
};

exports.destroy = function() {
    for (var i = 0; i < _timeoutIds.length; i++) {
        clearTimeout(_timeoutIds[i]);
    }
    _timeoutIds = [];
    App = null;
    vim = null;
    textUtil = null;
};
