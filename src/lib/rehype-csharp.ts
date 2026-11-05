// Highlights ```csharp blocks in lessons with the same colours as the editor.
import { tokenize } from './highlight';

type Node = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[]; value?: string };

function textOf(node: Node): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

function walk(node: Node) {
  for (const child of node.children ?? []) {
    if (child.tagName === 'pre') {
      const code = child.children?.find((c) => c.tagName === 'code');
      const cls = (code?.properties?.className as string[] | undefined) ?? [];
      if (code && cls.some((c) => c === 'language-csharp' || c === 'language-cs' || c === 'language-c#')) {
        const source = textOf(code).replace(/\n$/, '');
        code.children = tokenize(source).map((t) =>
          t.type === 'text'
            ? { type: 'text', value: t.text }
            : { type: 'element', tagName: 'span', properties: { className: [`tok-${t.type}`] }, children: [{ type: 'text', value: t.text }] },
        );
        child.properties = { ...(child.properties ?? {}), className: ['code'] };
      }
    } else walk(child);
  }
}

export default function rehypeCsharp() {
  return (tree: Node) => walk(tree);
}
