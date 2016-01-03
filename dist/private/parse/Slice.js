(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Loc', 'op/Op', '../token/Keyword', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Loc_1 = require('esast/lib/Loc');
    var Op_1 = require('op/Op');
    var Keyword_1 = require('../token/Keyword');
    var util_1 = require('../util');
    class Slice {
        constructor(tokens, start, end, loc) {
            this.tokens = tokens;
            this.start = start;
            this.end = end;
            this.loc = loc;
        }
        static of(group) {
            return new this(group.subTokens, 0, group.subTokens.length, group.loc);
        }
        size() {
            return this.end - this.start;
        }
        isEmpty() {
            return this.start === this.end;
        }
        head() {
            return this.tokens[this.start];
        }
        second() {
            return this.tokens[this.start + 1];
        }
        last() {
            return this.tokens[this.end - 1];
        }
        nextToLast() {
            return this.tokens[this.end - 2];
        }
        tail() {
            return this.chopStart(this.start + 1);
        }
        rtail() {
            return this.chopEnd(this.end - 1);
        }
        opSplitOnce(splitOn) {
            for (let i = this.start; i < this.end; i = i + 1) {
                const token = this.tokens[i];
                if (splitOn(token)) return {
                    before: this.chopEnd(i),
                    at: token,
                    after: this.chopStart(i + 1)
                };
            }
            return null;
        }
        opSplitMany(splitOn) {
            let iLast = this.start;
            const out = [];
            for (let i = this.start; i < this.end; i = i + 1) {
                const token = this.tokens[i];
                if (splitOn(token)) {
                    out.push({ before: this.chop(iLast, i), at: token });
                    iLast = i + 1;
                }
            }
            return Op_1.opIf(!util_1.isEmpty(out), () => {
                out.push({ before: this.chopStart(iLast), at: null });
                return out;
            });
        }
        *[Symbol.iterator]() {
            for (let i = this.start; i < this.end; i = i + 1) yield this.tokens[i];
        }
        map(mapper) {
            const out = [];
            for (const _ of this) out.push(mapper(_));
            return out;
        }
        slice(newStart, newEnd, newLoc) {
            return new this.constructor(this.tokens, newStart, newEnd, newLoc);
        }
        chop(newStart, newEnd) {
            return this.slice(newStart, newEnd, new Loc_1.default(this.tokens[newStart].loc.start, this.tokens[newEnd - 1].loc.end));
        }
        chopStart(newStart) {
            return this.slice(newStart, this.end, newStart === this.end ? this.loc : new Loc_1.default(this.tokens[newStart].loc.start, this.loc.end));
        }
        chopEnd(newEnd) {
            return this.slice(this.start, newEnd, newEnd === this.start ? this.loc : new Loc_1.default(this.loc.start, this.tokens[newEnd - 1].loc.end));
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Slice;
    class Lines extends Slice {
        static of(group) {
            return super.of(group);
        }
        *slices() {
            for (const _ of this) yield Tokens.of(_);
        }
        headSlice() {
            return Tokens.of(this.head());
        }
        lastSlice() {
            return Tokens.of(this.last());
        }
        mapSlices(mapper) {
            const out = [];
            for (const _ of this.slices()) out.push(mapper(_));
            return out;
        }
    }
    exports.Lines = Lines;
    class Tokens extends Slice {
        static of(group) {
            return super.of(group);
        }
        getKeywordSections(keywords) {
            const out = new Array(keywords.length + 1).fill(null);
            let iNextKeyword = 0;
            let iTokenPrev = this.start;
            for (let iToken = this.start; iToken < this.end; iToken = iToken + 1) {
                const token = this.tokens[iToken];
                if (token instanceof Keyword_1.default) {
                    const kind = token.kind;
                    for (let iKeyword = iNextKeyword; iKeyword < keywords.length; iKeyword = iKeyword + 1) if (kind === keywords[iKeyword]) {
                        out[iNextKeyword] = this.chop(iTokenPrev, iToken);
                        iNextKeyword = iKeyword + 1;
                        iTokenPrev = iToken + 1;
                    }
                }
            }
            out[iNextKeyword] = this.chopStart(iTokenPrev);
            return [Op_1.orThrow(util_1.head(out)), util_1.tail(out)];
        }
        takeKeywords() {
            for (var _len = arguments.length, keywords = Array(_len), _key = 0; _key < _len; _key++) {
                keywords[_key] = arguments[_key];
            }

            const out = new Array(keywords.length).fill(false);
            let iNextKeyword = 0;
            let iTokenPrev = this.start;
            for (let iToken = this.start; iToken < this.end; iToken = iToken + 1) {
                const token = this.tokens[iToken];
                if (token instanceof Keyword_1.default) {
                    const kind = token.kind;
                    for (let iKeyword = iNextKeyword; iKeyword < keywords.length; iKeyword = iKeyword + 1) if (kind === keywords[iKeyword]) {
                        out[iNextKeyword] = true;
                        iNextKeyword = iNextKeyword + 1;
                        iTokenPrev = iToken + 1;
                    }
                }
            }
            return [out, this.chopStart(iTokenPrev)];
        }
    }
    exports.Tokens = Tokens;
});
//# sourceMappingURL=Slice.js.map
