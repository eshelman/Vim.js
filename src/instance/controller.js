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
    vim.backToHistory(list);
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

exports.destroy = function() {
    for (var i = 0; i < _timeoutIds.length; i++) {
        clearTimeout(_timeoutIds[i]);
    }
    _timeoutIds = [];
    App = null;
    vim = null;
    textUtil = null;
};
