(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './parseClass', './parseExcept', './parseExpr', './parseSingle', './parseSpaced', './parseSwitch', './parse*'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./parseClass'), require('./parseExcept'), require('./parseExpr'), require('./parseSingle'), require('./parseSpaced'), require('./parseSwitch'), require('./parse*'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.parseClass, global.parseExcept, global.parseExpr, global.parseSingle, global.parseSpaced, global.parseSwitch, global.parse);
    global.loadParse = mod.exports;
  }
})(this, function (exports, _parseClass, _parseExcept, _parseExpr, _parseSingle, _parseSpaced, _parseSwitch, _parse) {
  // TODO:ES6 Recursive modules should work, so this should not be necessary.

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _parseClass2 = _interopRequireDefault(_parseClass);

  var _parseExcept2 = _interopRequireDefault(_parseExcept);

  var _parseExpr2 = _interopRequireDefault(_parseExpr);

  var _parseSingle2 = _interopRequireDefault(_parseSingle);

  var _parseSpaced2 = _interopRequireDefault(_parseSpaced);

  var _parseSwitch2 = _interopRequireDefault(_parseSwitch);

  (0, _parse.load)({ parseClass: _parseClass2.default, parseExcept: _parseExcept2.default, parseExpr: _parseExpr2.default, parseExprParts: _parseExpr.parseExprParts, parseSingle: _parseSingle2.default, parseSpaced: _parseSpaced2.default, parseSwitch: _parseSwitch2.default });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL2xvYWRQYXJzZSouanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVVBLGFBRlEsSUFBSSxFQUVQLEVBQUMsVUFBVSxzQkFBQSxFQUFFLFdBQVcsdUJBQUEsRUFBRSxTQUFTLHFCQUFBLEVBQUUsY0FBYyxhQU5yQyxjQUFjLEFBTXVCLEVBQUUsV0FBVyx1QkFBQSxFQUFFLFdBQVcsdUJBQUEsRUFBRSxXQUFXLHVCQUFBLEVBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6ImxvYWRQYXJzZSouanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUT0RPOkVTNiBSZWN1cnNpdmUgbW9kdWxlcyBzaG91bGQgd29yaywgc28gdGhpcyBzaG91bGQgbm90IGJlIG5lY2Vzc2FyeS5cblxuaW1wb3J0IHBhcnNlQ2xhc3MgZnJvbSAnLi9wYXJzZUNsYXNzJ1xuaW1wb3J0IHBhcnNlRXhjZXB0IGZyb20gJy4vcGFyc2VFeGNlcHQnXG5pbXBvcnQgcGFyc2VFeHByLCB7cGFyc2VFeHByUGFydHN9IGZyb20gJy4vcGFyc2VFeHByJ1xuaW1wb3J0IHBhcnNlU2luZ2xlIGZyb20gJy4vcGFyc2VTaW5nbGUnXG5pbXBvcnQgcGFyc2VTcGFjZWQgZnJvbSAnLi9wYXJzZVNwYWNlZCdcbmltcG9ydCBwYXJzZVN3aXRjaCBmcm9tICcuL3BhcnNlU3dpdGNoJ1xuaW1wb3J0IHtsb2FkfSBmcm9tICcuL3BhcnNlKidcblxubG9hZCh7cGFyc2VDbGFzcywgcGFyc2VFeGNlcHQsIHBhcnNlRXhwciwgcGFyc2VFeHByUGFydHMsIHBhcnNlU2luZ2xlLCBwYXJzZVNwYWNlZCwgcGFyc2VTd2l0Y2h9KVxuIl19