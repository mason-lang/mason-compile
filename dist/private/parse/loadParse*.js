if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', './parseClass', './parseExcept', './parseExpr', './parseSingle', './parseSpaced', './parseSwitch', './parse*'], function (exports, _parseClass, _parseExcept, _parseExpr, _parseSingle, _parseSpaced, _parseSwitch, _parse) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvYWRQYXJzZSouanMiLCJwcml2YXRlL3BhcnNlL2xvYWRQYXJzZSouanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNVQSxhQUZRLElBQUksRUFFUCxFQUFDLFVBQVUsc0JBQUEsRUFBRSxXQUFXLHVCQUFBLEVBQUUsU0FBUyxxQkFBQSxFQUFFLGNBQWMsYUFOckMsY0FBYyxBQU11QixFQUFFLFdBQVcsdUJBQUEsRUFBRSxXQUFXLHVCQUFBLEVBQUUsV0FBVyx1QkFBQSxFQUFDLENBQUMsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3BhcnNlL2xvYWRQYXJzZSouanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsIi8vIFRPRE86RVM2IFJlY3Vyc2l2ZSBtb2R1bGVzIHNob3VsZCB3b3JrLCBzbyB0aGlzIHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5LlxuXG5pbXBvcnQgcGFyc2VDbGFzcyBmcm9tICcuL3BhcnNlQ2xhc3MnXG5pbXBvcnQgcGFyc2VFeGNlcHQgZnJvbSAnLi9wYXJzZUV4Y2VwdCdcbmltcG9ydCBwYXJzZUV4cHIsIHtwYXJzZUV4cHJQYXJ0c30gZnJvbSAnLi9wYXJzZUV4cHInXG5pbXBvcnQgcGFyc2VTaW5nbGUgZnJvbSAnLi9wYXJzZVNpbmdsZSdcbmltcG9ydCBwYXJzZVNwYWNlZCBmcm9tICcuL3BhcnNlU3BhY2VkJ1xuaW1wb3J0IHBhcnNlU3dpdGNoIGZyb20gJy4vcGFyc2VTd2l0Y2gnXG5pbXBvcnQge2xvYWR9IGZyb20gJy4vcGFyc2UqJ1xuXG5sb2FkKHtwYXJzZUNsYXNzLCBwYXJzZUV4Y2VwdCwgcGFyc2VFeHByLCBwYXJzZUV4cHJQYXJ0cywgcGFyc2VTaW5nbGUsIHBhcnNlU3BhY2VkLCBwYXJzZVN3aXRjaH0pXG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==
