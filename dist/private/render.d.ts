import Node from 'esast/lib/ast';
export default function render(esAst: Node): {
    code: string;
    sourceMap: string;
};
