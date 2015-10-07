if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', 'module', '../MsAst', './parse*'], function (exports, module, _MsAst, _parse) {
	'use strict';

	module.exports = tokens => new _MsAst.Quote(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : (0, _parse.parseSingle)(_)));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlUXVvdGUuanMiLCJwcml2YXRlL3BhcnNlL3BhcnNlUXVvdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztrQkNHZSxNQUFNLElBQ3BCLFdBSk8sS0FBSyxDQUlGLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxXQUgzRCxXQUFXLEVBRzRELENBQUMsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoicHJpdmF0ZS9wYXJzZS9wYXJzZVF1b3RlLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge1F1b3RlfSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7cGFyc2VTaW5nbGV9IGZyb20gJy4vcGFyc2UqJ1xuXG5leHBvcnQgZGVmYXVsdCB0b2tlbnMgPT5cblx0bmV3IFF1b3RlKHRva2Vucy5sb2MsIHRva2Vucy5tYXAoXyA9PiB0eXBlb2YgXyA9PT0gJ3N0cmluZycgPyBfIDogcGFyc2VTaW5nbGUoXykpKVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
