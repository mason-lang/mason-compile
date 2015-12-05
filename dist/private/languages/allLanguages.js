'use strict';

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './english'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./english'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.english);
    global.allLanguages = mod.exports;
  }
})(this, function (exports, _english) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _english2 = _interopRequireDefault(_english);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.default = { english: _english2.default };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xhbmd1YWdlcy9hbGxMYW5ndWFnZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQUVlLEVBQUMsT0FBTyxtQkFBQSxFQUFDIiwiZmlsZSI6ImFsbExhbmd1YWdlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBlbmdsaXNoIGZyb20gJy4vZW5nbGlzaCdcblxuZXhwb3J0IGRlZmF1bHQge2VuZ2xpc2h9XG4iXX0=