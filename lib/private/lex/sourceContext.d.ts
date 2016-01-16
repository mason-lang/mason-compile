import { Pos } from 'esast/lib/Loc';
import Char from 'typescript-char/Char';
export declare let index: number;
export declare let line: number;
export declare let column: number;
export declare let sourceString: string;
export declare function setupSourceContext(source: string): void;
export declare function pos(): Pos;
export declare function peek(n?: number): Char;
export declare function eat(): Char;
export declare function skip(n?: number): void;
export declare function tryEat(charToEat: Char): boolean;
export declare function tryEat2(char1: Char, char2: Char): boolean;
export declare function tryEat3(char1: Char, char2: Char, char3: Char): boolean;
export declare function tryEatNewline(): boolean;
export declare function stepBackMany(oldPos: Pos, nCharsToBackUp: number): void;
export declare function takeWhile(characterPredicate: (_: Char) => boolean): string;
export declare function takeWhileWithPrev(characterPredicate: (_: Char) => boolean): string;
export declare function skipWhileEquals(char: Char): number;
export declare function skipRestOfLine(): number;
export declare function eatRestOfLine(): string;
export declare function skipWhile(characterPredicate: (_: Char) => boolean): number;
export declare function skipNewlines(): number;