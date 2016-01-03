import Node from 'esast/lib/Node';
export default function render(esAst: Node): {
    code: string;
    sourceMap: string;
};
