(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../context', '../Token', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var context_1 = require('../context');
    var Token_1 = require('../Token');
    var util_1 = require('../util');
    let groupStack;
    function setupGroupContext() {
        exports.curGroup = new Token_1.GroupBlock(new Loc_1.default(Loc_1.Pos.start, null), []);
        groupStack = [];
    }
    exports.setupGroupContext = setupGroupContext;
    function tearDownGroupContext(endPos) {
        closeLine(endPos);
        util_1.assert(util_1.isEmpty(groupStack));
        exports.curGroup.loc.end = endPos;
        const res = exports.curGroup;
        groupStack = exports.curGroup = null;
        return res;
    }
    exports.tearDownGroupContext = tearDownGroupContext;
    function addToCurrentGroup(token) {
        exports.curGroup.subTokens.push(token);
    }
    exports.addToCurrentGroup = addToCurrentGroup;
    function dropGroup() {
        exports.curGroup = groupStack.pop();
    }
    function openGroup(openPos, groupType) {
        groupStack.push(exports.curGroup);
        exports.curGroup = new groupType(new Loc_1.default(openPos, null), []);
    }
    exports.openGroup = openGroup;
    function maybeCloseGroup(closePos, closeType) {
        if (exports.curGroup instanceof closeType) closeGroupNoCheck(closePos, closeType);
    }
    exports.maybeCloseGroup = maybeCloseGroup;
    function closeGroup(closePos, closeType) {
        context_1.check(exports.curGroup instanceof closeType, closePos, _ => _.mismatchedGroupClose(closeType, exports.curGroup));
        closeGroupNoCheck(closePos, closeType);
    }
    exports.closeGroup = closeGroup;
    function closeGroupNoCheck(closePos, closeType) {
        const justClosed = exports.curGroup;
        dropGroup();
        justClosed.loc.end = closePos;
        switch (closeType) {
            case Token_1.GroupSpace:
                {
                    const size = justClosed.subTokens.length;
                    if (size === 0) context_1.warn(justClosed.loc, _ => _.extraSpace);else addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);
                    break;
                }
            case Token_1.GroupLine:
                if (!util_1.isEmpty(justClosed.subTokens)) addToCurrentGroup(justClosed);
                break;
            case Token_1.GroupBlock:
                context_1.check(!util_1.isEmpty(justClosed.subTokens), closePos, _ => _.emptyBlock);
                addToCurrentGroup(justClosed);
                break;
            default:
                addToCurrentGroup(justClosed);
        }
    }
    function closeSpaceOKIfEmpty(pos) {
        util_1.assert(exports.curGroup instanceof Token_1.GroupSpace);
        if (exports.curGroup.subTokens.length === 0) dropGroup();else closeGroupNoCheck(pos, Token_1.GroupSpace);
    }
    exports.closeSpaceOKIfEmpty = closeSpaceOKIfEmpty;
    function openParenthesis(loc) {
        openGroup(loc.start, Token_1.GroupParenthesis);
        openGroup(loc.end, Token_1.GroupSpace);
    }
    exports.openParenthesis = openParenthesis;
    function openInterpolation(loc) {
        openGroup(loc.start, Token_1.GroupInterpolation);
        openGroup(loc.end, Token_1.GroupSpace);
    }
    exports.openInterpolation = openInterpolation;
    function closeInterpolationOrParenthesis(loc) {
        closeGroupNoCheck(loc.start, Token_1.GroupSpace);
        const group = exports.curGroup;
        closeGroup(loc.end, group.type);
        return group instanceof Token_1.GroupInterpolation;
    }
    exports.closeInterpolationOrParenthesis = closeInterpolationOrParenthesis;
    function closeGroupsForDedent(pos) {
        closeLine(pos);
        closeGroup(pos, Token_1.GroupBlock);
        while (exports.curGroup instanceof Token_1.GroupParenthesis || exports.curGroup instanceof Token_1.GroupSpace) closeGroupNoCheck(pos, exports.curGroup.type);
    }
    exports.closeGroupsForDedent = closeGroupsForDedent;
    function openLine(pos) {
        openGroup(pos, Token_1.GroupLine);
        openGroup(pos, Token_1.GroupSpace);
    }
    exports.openLine = openLine;
    function closeLine(pos) {
        if (exports.curGroup instanceof Token_1.GroupSpace) closeSpaceOKIfEmpty(pos);
        closeGroup(pos, Token_1.GroupLine);
    }
    exports.closeLine = closeLine;
    function space(loc) {
        maybeCloseGroup(loc.start, Token_1.GroupSpace);
        openGroup(loc.end, Token_1.GroupSpace);
    }
    exports.space = space;
});
//# sourceMappingURL=groupContext.js.map
