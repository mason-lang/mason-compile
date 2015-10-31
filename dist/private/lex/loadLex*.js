'use strict';

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['./lexQuote', './lex*'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('./lexQuote'), require('./lex*'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.lexQuote, global.lex);
    global.loadLex = mod.exports;
  }
})(this, function (_lexQuote, _lex) {
  var _lexQuote2 = _interopRequireDefault(_lexQuote);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  (0, _lex.load)({
    lexQuote: _lexQuote2.default
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJsb2FkTGV4Ki5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=