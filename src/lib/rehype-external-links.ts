// Links in lesson text that go to another site open in a new tab.
type Node = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[]; value?: string };

function walk(node: Node) {
  for (const child of node.children ?? []) {
    const href = child.tagName === 'a' ? String(child.properties?.href ?? '') : '';
    if (/^https?:\/\//.test(href)) {
      child.properties = { ...child.properties, target: '_blank', rel: ['noopener', 'noreferrer'] };
      child.children = [
        ...(child.children ?? []),
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['visually-hidden'] },
          children: [{ type: 'text', value: ' (opens in a new tab)' }],
        },
      ];
    }
    walk(child);
  }
}

export default function rehypeExternalLinks() {
  return (tree: Node) => walk(tree);
}
