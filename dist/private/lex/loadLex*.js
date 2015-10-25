(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './lexQuote', './lex*'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./lexQuote'), require('./lex*'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.lexQuote, global.lex);
    global.loadLex = mod.exports;
  }
})(this, function (exports, _lexQuote, _lex) {
  // TODO:ES6 Recursive modules should work, so this should not be necessary.

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _lexQuote2 = _interopRequireDefault(_lexQuote);

  (0, _lex.load)({ lexQuote: _lexQuote2.default });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9sb2FkTGV4Ki5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxXQUZRLElBQUksRUFFUCxFQUFDLFFBQVEsb0JBQUEsRUFBQyxDQUFDLENBQUEiLCJmaWxlIjoibG9hZExleCouanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPOkVTNiBSZWN1cnNpdmUgbW9kdWxlcyBzaG91bGQgd29yaywgc28gdGhpcyBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeS5cblxuaW1wb3J0IGxleFF1b3RlIGZyb20gJy4vbGV4UXVvdGUnXG5pbXBvcnQge2xvYWR9IGZyb20gJy4vbGV4KidcblxubG9hZCh7bGV4UXVvdGV9KVxuIl19