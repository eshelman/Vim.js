/**
 * Test setup factory: creates a fully-wired Vim.js environment without DOM event binding.
 *
 * Reconstructs App → Controller → Vim → TextUtil using actual constructors,
 * but overrides _bind() to skip DOM event listeners.
 */
import { createMockElement } from './mock-element.js';

// Import source modules — vitest + commonjs plugin handles require() transforms
var _ = require('../../src/util/helper.js');
var extend = _.extend;

function Router() { this._init(); }
extend(Router.prototype, require('../../src/instance/router/router.js'));

function Vim(textUtil) { this._init(textUtil); }
extend(Vim.prototype, require('../../src/instance/vim/vim.js'));

function TextUtil(element) { this._init(element); }
extend(TextUtil.prototype, require('../../src/instance/text/text.js'));

function Controller(app) { this._init(app); }
extend(Controller.prototype, require('../../src/instance/controller.js'));

function App(options) { this._init(options); }
var p = App.prototype;
extend(p, require('../../src/instance/app/app.js'));
p.classes = {};
p.class('Router', Router);
p.class('Vim', Vim);
p.class('TextUtil', TextUtil);
p.class('Controller', Controller);

// Override _bind to be a no-op (no DOM events needed in tests)
var origStart = p._start;
p._start = function () {
  this._route();
  // Skip this._bind() — no DOM
};

/**
 * Create a test environment.
 * @param {string} text - Initial text content
 * @param {number} cursor - Initial cursor position (defaults to 0)
 * @returns {{ app, vim, textUtil, el, controller }}
 */
export function setup(text, cursor) {
  var el = createMockElement(text || '', cursor || 0);
  // App._init reads currentEle from options — but it's set to undefined initially.
  // We need to set it before _init runs. Use a wrapper approach:
  // App._init calls createClass('TextUtil', this.currentEle) so we set currentEle via config.
  var app = Object.create(App.prototype);
  // Copy fresh init state
  extend(app, require('../../src/instance/app/init.js'));
  var config = require('../../src/config.js');
  app.config = extend({}, config);
  app.config.debug = false;
  app.key_code_white_list = app.config.key_code_white_list;
  app.currentEle = el;
  app.boxes = [el];
  app.doList = [];
  app._number = '';
  app._events = {};
  app.classes = {};
  // Register classes on this instance
  app.classes['Router'] = Router;
  app.classes['Vim'] = Vim;
  app.classes['TextUtil'] = TextUtil;
  app.classes['Controller'] = Controller;

  app.router = app.createClass('Router');
  app.textUtil = app.createClass('TextUtil', el);
  app.vim = app.createClass('Vim', app.textUtil);
  app.controller = app.createClass('Controller', app);

  // Register routes (keybindings)
  var routes = require('../../src/routes.js');
  routes.ready(app.router);

  // Set cursor position (select the character at cursor)
  if (text && text.length > 0) {
    var c = cursor || 0;
    el.selectionStart = c;
    el.selectionEnd = c + 1;
  }

  return { app, vim: app.vim, textUtil: app.textUtil, el, controller: app.controller };
}

/**
 * Simulate a keypress through parseRoute.
 * For simple keys, pass the keyCode. For shifted keys, set opts.shift = true.
 *
 * @param {object} app - The App instance
 * @param {number} code - The keyCode
 * @param {object} [opts] - Options: { shift, key }
 */
export function pressKey(app, code, opts) {
  opts = opts || {};
  var ev = {
    keyCode: code,
    which: code,
    shiftKey: opts.shift || false,
    metaKey: false,
    ctrlKey: false,
    key: opts.key || String.fromCharCode(code),
    preventDefault: function () {},
  };
  var num = app.numberManager(code);
  app.parseRoute(code, ev, num);
}

/**
 * Simulate a compound key (e.g., dd, dw, yy, gg) by calling pressKey twice
 * and using isUnionCode with -1 (no time limit).
 *
 * @param {object} app - The App instance
 * @param {number} code1 - First keyCode
 * @param {number} code2 - Second keyCode
 * @param {object} [opts2] - Options for second keypress
 */
export function pressCompoundKey(app, code1, code2, opts2) {
  opts2 = opts2 || {};
  // First key: register in numberManager and set prevCode
  var num1 = app.numberManager(code1);
  // Set up the union code tracking
  app.prevCode = code1;
  app.prevCodeTime = Date.now();

  // Second key: compute union code
  var unionCode = app.isUnionCode(code2, -1);
  var vimKeys = app.router.getKeys();

  var actualCode = (unionCode && vimKeys[unionCode]) ? unionCode : code2;
  var ev = {
    keyCode: code2,
    which: code2,
    shiftKey: opts2.shift || false,
    metaKey: false,
    ctrlKey: false,
    key: opts2.key || String.fromCharCode(code2),
    preventDefault: function () {},
  };
  var num = app.numberManager(actualCode);
  app.parseRoute(actualCode, ev, num);
}

/**
 * Simulate a find-char sequence: press the motion key (f/F/t/T), then the target char.
 *
 * @param {object} app - The App instance
 * @param {number} motionCode - keyCode for f(70), F(70+shift), t(84), T(84+shift)
 * @param {boolean} shift - Whether shift is held (for F/T)
 * @param {string} char - The target character
 */
export function pressFindChar(app, motionCode, shift, char) {
  // Press the motion key (f/F/t/T)
  pressKey(app, motionCode, { shift: shift });

  // Now vim.findCharRequest should be set. Execute the find.
  var req = app.vim.findCharRequest;
  if (req) {
    app.vim.findCharRequest = null;
    if (req.operator) {
      app.controller.executeOperatorFindChar(char, req);
    } else {
      app.controller.executeFindChar(char, req);
    }
  }
}

/**
 * Simulate an operator + find-char sequence (e.g., df{char}, dt{char}, yf{char}).
 *
 * @param {object} app - The App instance
 * @param {number} opCode - keyCode for operator (d=68, y=89, c=67)
 * @param {number} motionCode - keyCode for motion (f=70, t=84)
 * @param {boolean} motionShift - Whether shift for F/T
 * @param {string} char - The target character
 */
export function pressOperatorFindChar(app, opCode, motionCode, motionShift, char) {
  // Press compound: operator + motion
  pressCompoundKey(app, opCode, motionCode, { shift: motionShift });

  // Now vim.findCharRequest should be set with operator
  var req = app.vim.findCharRequest;
  if (req) {
    app.vim.findCharRequest = null;
    app.controller.executeOperatorFindChar(char, req);
  }
}

/**
 * Press a number prefix (e.g., 3 before dd).
 *
 * @param {object} app - The App instance
 * @param {number} n - The number to press (0-9 digits will be pressed individually)
 */
export function pressNumber(app, n) {
  var digits = String(n).split('');
  for (var i = 0; i < digits.length; i++) {
    var code = 48 + parseInt(digits[i]);
    app.numberManager(code);
  }
}

// Key code constants for convenience
export const KEY = {
  H: 72, L: 76, J: 74, K: 75,
  W: 87, B: 66, E: 69,
  D: 68, Y: 89, C: 67, P: 80, U: 85,
  X: 88, S: 83,
  I: 73, A: 65, O: 79, R: 82,
  V: 86, G: 71, F: 70, T: 84,
  ESC: 27, ENTER: 13,
  ZERO: 48, FOUR: 52, NINE: 57,
  DOT: 190,
  SEMICOLON: 186, COMMA: 188,
  LBRACKET: 219, RBRACKET: 221,
};
