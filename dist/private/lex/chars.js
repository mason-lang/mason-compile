(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../CompileError'], factory);
    }
})(function (require, exports) {
    "use strict";

    var CompileError_1 = require('../../CompileError');
    (function (Char) {
        Char[Char["Ampersand"] = c('&')] = "Ampersand";
        Char[Char["Backslash"] = c('\\')] = "Backslash";
        Char[Char["Backtick"] = c('`')] = "Backtick";
        Char[Char["Bang"] = c('!')] = "Bang";
        Char[Char["Bar"] = c('|')] = "Bar";
        Char[Char["Caret"] = c('^')] = "Caret";
        Char[Char["Cash"] = c('$')] = "Cash";
        Char[Char["CloseBrace"] = c('}')] = "CloseBrace";
        Char[Char["CloseBracket"] = c(']')] = "CloseBracket";
        Char[Char["CloseParenthesis"] = c(')')] = "CloseParenthesis";
        Char[Char["Colon"] = c(':')] = "Colon";
        Char[Char["Comma"] = c('),')] = "Comma";
        Char[Char["Dot"] = c('.')] = "Dot";
        Char[Char["Equal"] = c('=')] = "Equal";
        Char[Char["G"] = c('g')] = "G";
        Char[Char["Hash"] = c('#')] = "Hash";
        Char[Char["Hyphen"] = c('-')] = "Hyphen";
        Char[Char["I"] = c('i')] = "I";
        Char[Char["LetterB"] = c('b')] = "LetterB";
        Char[Char["LetterO"] = c('o')] = "LetterO";
        Char[Char["LetterX"] = c('x')] = "LetterX";
        Char[Char["M"] = c('m')] = "M";
        Char[Char["N0"] = c('0')] = "N0";
        Char[Char["N1"] = c('1')] = "N1";
        Char[Char["N2"] = c('2')] = "N2";
        Char[Char["N3"] = c('3')] = "N3";
        Char[Char["N4"] = c('4')] = "N4";
        Char[Char["N5"] = c('5')] = "N5";
        Char[Char["N6"] = c('6')] = "N6";
        Char[Char["N7"] = c('7')] = "N7";
        Char[Char["N8"] = c('8')] = "N8";
        Char[Char["N9"] = c('9')] = "N9";
        Char[Char["Newline"] = c('\n')] = "Newline";
        Char[Char["Null"] = c('\0')] = "Null";
        Char[Char["OpenBrace"] = c('{')] = "OpenBrace";
        Char[Char["OpenBracket"] = c('[')] = "OpenBracket";
        Char[Char["OpenParenthesis"] = c('(')] = "OpenParenthesis";
        Char[Char["Percent"] = c('%')] = "Percent";
        Char[Char["Quote"] = c('"')] = "Quote";
        Char[Char["Semicolon"] = c(';')] = "Semicolon";
        Char[Char["Space"] = c(' ')] = "Space";
        Char[Char["Star"] = c('*')] = "Star";
        Char[Char["Tab"] = c('\t')] = "Tab";
        Char[Char["Tick"] = c('\'')] = "Tick";
        Char[Char["Tilde"] = c('~')] = "Tilde";
        Char[Char["Y"] = c('y')] = "Y";
    })(exports.Char || (exports.Char = {}));
    var Char = exports.Char;
    function c(char) {
        return char.charCodeAt(0);
    }
    function showChar(char) {
        return CompileError_1.code(String.fromCharCode(char));
    }
    exports.showChar = showChar;
    function charPred(chars) {
        let negate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        let src = 'switch(ch) {\n';
        for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;
        src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
        return Function('ch', src);
    }
    exports.isDigit = charPred('0123456789'), exports.isDigitBinary = charPred('01'), exports.isDigitOctal = charPred('01234567'), exports.isDigitHex = charPred('0123456789abcdef');
    const reservedCharacters = '#%^\\;,';
    exports.isNameCharacter = charPred(`\`&()[]{}|:'". \n\t${ reservedCharacters }`, true);
});
//# sourceMappingURL=chars.js.map
