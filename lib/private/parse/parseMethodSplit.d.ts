import { KeywordFunOptions } from '../token/Keyword';
import { Tokens } from './Slice';
export default function parseMethodSplit(tokens: Tokens): {
    before: Tokens;
    options: KeywordFunOptions;
    after: Tokens;
};
