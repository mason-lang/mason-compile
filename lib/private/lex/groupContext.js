(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', '../context', '../token/Group', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Loc_1 = require('esast/lib/Loc');
    const context_1 = require('../context');
    const Group_1 = require('../token/Group');
    const util_1 = require('../util');
    let groupStack;
    function setupGroupContext() {
        exports.curGroup = new Group_1.GroupBlock(new Loc_1.default(Loc_1.Pos.start, null), []);
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
            case Group_1.GroupSpace:
                {
                    const size = justClosed.subTokens.length;
                    if (size === 0) context_1.warn(justClosed.loc, _ => _.extraSpace);else addToCurrentGroup(size === 1 ? justClosed.subTokens[0] : justClosed);
                    break;
                }
            case Group_1.GroupLine:
                if (!util_1.isEmpty(justClosed.subTokens)) addToCurrentGroup(justClosed);
                break;
            case Group_1.GroupBlock:
                context_1.check(!util_1.isEmpty(justClosed.subTokens), closePos, _ => _.emptyBlock);
                addToCurrentGroup(justClosed);
                break;
            default:
                addToCurrentGroup(justClosed);
        }
    }
    function closeSpaceOKIfEmpty(pos) {
        util_1.assert(exports.curGroup instanceof Group_1.GroupSpace);
        if (exports.curGroup.subTokens.length === 0) dropGroup();else closeGroupNoCheck(pos, Group_1.GroupSpace);
    }
    exports.closeSpaceOKIfEmpty = closeSpaceOKIfEmpty;
    function openParenthesis(loc) {
        openGroup(loc.start, Group_1.GroupParenthesis);
        openGroup(loc.end, Group_1.GroupSpace);
    }
    exports.openParenthesis = openParenthesis;
    function openInterpolation(loc) {
        openGroup(loc.start, Group_1.GroupInterpolation);
        openGroup(loc.end, Group_1.GroupSpace);
    }
    exports.openInterpolation = openInterpolation;
    function closeInterpolationOrParenthesis(loc) {
        closeGroupNoCheck(loc.start, Group_1.GroupSpace);
        const group = exports.curGroup;
        closeGroup(loc.end, group.type);
        return group instanceof Group_1.GroupInterpolation;
    }
    exports.closeInterpolationOrParenthesis = closeInterpolationOrParenthesis;
    function closeGroupsForDedent(pos) {
        closeLine(pos);
        closeGroup(pos, Group_1.GroupBlock);
        while (exports.curGroup instanceof Group_1.GroupParenthesis || exports.curGroup instanceof Group_1.GroupSpace) closeGroupNoCheck(pos, exports.curGroup.type);
    }
    exports.closeGroupsForDedent = closeGroupsForDedent;
    function openLine(pos) {
        openGroup(pos, Group_1.GroupLine);
        openGroup(pos, Group_1.GroupSpace);
    }
    exports.openLine = openLine;
    function closeLine(pos) {
        if (exports.curGroup instanceof Group_1.GroupSpace) closeSpaceOKIfEmpty(pos);
        closeGroup(pos, Group_1.GroupLine);
    }
    exports.closeLine = closeLine;
    function space(loc) {
        maybeCloseGroup(loc.start, Group_1.GroupSpace);
        openGroup(loc.end, Group_1.GroupSpace);
    }
    exports.space = space;
});
//# sourceMappingURL=groupContext.js.map
