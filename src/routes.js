/**
 * Created by top on 15-9-6.
 */

exports.ready = function(router){

    //---------------------------
    //system feature keys:
    //---------------------------

    router.code(35, 'End').action('End', 'moveToCurrentLineTail');
    router.code(36, 'Home').action('Home', 'moveToCurrentLineHead');
    router.code(37, 'Left').action('Left', 'selectPrevCharacter');
    router.code(38, 'Up').action('Up', 'selectPrevLine');
    router.code(39, 'Right').action('Right', 'selectNextCharacter');
    router.code(40, 'Down').action('Down', 'selectNextLine');
    router.code(45, 'Insert').action('Insert', 'insert');
    router.code(46, 'Delete').action('Delete', 'delCharAfter').record(true);

    //---------------------------
    //vim feature keys:
    //---------------------------

    //0:move to current line head, ):move to next sentence
    router.code(48, '0').action(0, 'moveToCurrentLineHead').action('shift_0', 'moveToNextSentence');
    //&:move to current line tail
    router.code(52, '4').action('shift_4', 'moveToCurrentLineTail');
    //append
    router.code(65, 'a').action('a', 'append').action('A', 'appendLineTail');
    //insert
    router.code(73, 'i').action('i', 'insert').action('I', 'insertLineHead');
    //new line
    router.code(79, 'o').action('o', 'appendNewLine').action('O', 'insertNewLine').record(true);
    //replace
    router.code(82, 'r').action('r', 'replaceChar');
    //down
    router.code(13, 'enter').action('enter', 'selectNextLine');
    router.code(74, 'j').action('j', 'selectNextLine');
    //up
    router.code(75, 'k').action('k', 'selectPrevLine');
    //left
    router.code(72, 'h').action('h', 'selectPrevCharacter');
    //right
    router.code(76, 'l').action('l', 'selectNextCharacter');
    //paste
    router.code(80, 'p').action('p', 'pasteAfter').action('P', 'pasteBefore').record(true);
    //back
    router.code(85, 'u').action('u', 'backToHistory');
    //copy char
    router.code(89, 'y').action('y', 'copyChar').mode('visual_mode');
    router.code('89_89', 'yy').action('yy', 'copyCurrentLine');
    //v
    router.code(86, 'v').action('v', 'switchModeToVisual').action('V', 'switchModeToVisual');
    //delete character
    router.code(88, 'x').action('x', 'delCharAfter').action('X', 'delCharBefore').record(true);
    //delete selected char in visual mode
    router.code(68, 'd').action('d', 'delCharAfter').mode('visual_mode').record(true);
    //delete line
    router.code('68_68', 'dd').action('dd', 'delCurrLine').record(true);
    //G
    router.code(71, 'g').action('G', 'moveToLastLine');
    //gg
    router.code('71_71', 'gg').action('gg', 'moveToFirstLine');
    //move to next word
    router.code(87, 'w').action('w', 'moveToNextWord').action('W', 'moveToNextWord');
    //move to previous word
    router.code(66, 'b').action('b', 'moveToPrevWord').action('B', 'moveToPrevBigWord');
    //copy word
    router.code('89_87', 'yw').action('yw', 'copyWord');
    //delete one word
    router.code('68_87', 'dw').action('dw', 'deleteWord').record(true);
    //copy previous word
    router.code('89_66', 'yb').action('yb', 'copyPrevWord');
    //delete previous word
    router.code('68_66', 'db').action('db', 'deletePrevWord').record(true);
    //change (delete + enter insert mode)
    router.code(67, 'c').action('c', 'changeSelection').action('C', 'changeToEnd').record(true);
    router.code('67_67', 'cc').action('cc', 'changeLine').record(true);
    router.code('67_87', 'cw').action('cw', 'changeWord').record(true);
    router.code('67_66', 'cb').action('cb', 'changePrevWord').record(true);
    //substitute
    router.code(83, 's').action('s', 'substitute').action('S', 'substituteLine').record(true);
    //sentence motions
    router.code(57, '9').action('shift_9', 'moveToPrevSentence');
    //paragraph motions
    router.code(219, '[').action('shift_[', 'moveToPrevParagraph');
    router.code(221, ']').action('shift_]', 'moveToNextParagraph');
    //dot repeat
    router.code(190, '.').action('.', 'dotRepeat');

    //find character motions (f/F/t/T)
    router.code(70, 'f').action('f', 'findForward').action('F', 'findBackward');
    router.code(84, 't').action('t', 'tillForward').action('T', 'tillBackward');
    //repeat find (; and ,)
    router.code(186, ';').action(';', 'repeatFindForward');
    router.code(188, ',').action(',', 'repeatFindBackward');
    //word end motion
    router.code(69, 'e').action('e', 'moveToWordEnd').action('E', 'moveToWordEndBig');

    //delete with find/till char (df/dF/dt/dT)
    router.code('68_70', 'df').action('df', 'deleteFindForward').action('DF', 'deleteFindBackward').record(true);
    router.code('68_84', 'dt').action('dt', 'deleteTillForward').action('DT', 'deleteTillBackward').record(true);
    //yank with find/till char (yf/yF/yt/yT)
    router.code('89_70', 'yf').action('yf', 'yankFindForward').action('YF', 'yankFindBackward');
    router.code('89_84', 'yt').action('yt', 'yankTillForward').action('YT', 'yankTillBackward');

    //search motions (/, ?, n, N, *, #)
    router.code(191, '/').action('/', 'searchForward').action('shift_/', 'searchBackward');
    router.code(78, 'n').action('n', 'searchNext').action('N', 'searchPrev');
    router.code(56, '8').action('shift_8', 'searchWordForward');
    router.code(51, '3').action('shift_3', 'searchWordBackward');

    //text objects: operator + i/a (inner/a) — sets pending textObjectRequest
    //delete text objects (di/da)
    router.code('68_73', 'di').action('di', 'deleteInnerObject').record(true);
    router.code('68_65', 'da').action('da', 'deleteAObject').record(true);
    //yank text objects (yi/ya)
    router.code('89_73', 'yi').action('yi', 'yankInnerObject');
    router.code('89_65', 'ya').action('ya', 'yankAObject');
    //change text objects (ci/ca)
    router.code('67_73', 'ci').action('ci', 'changeInnerObject').record(true);
    router.code('67_65', 'ca').action('ca', 'changeAObject').record(true);
}
