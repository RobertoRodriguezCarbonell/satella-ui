/** Árbol anidado construido a partir de las rutas de los tokens. */
import type { ResolvedToken, TokenMap } from './model.ts';

export interface Leaf<T> {
  kind: 'leaf';
  token: ResolvedToken;
  value: T;
}

export interface Branch<T> {
  kind: 'branch';
  children: Map<string, TreeNode<T>>;
}

export type TreeNode<T> = Leaf<T> | Branch<T>;

export function buildTree<T>(tokens: TokenMap, pick: (token: ResolvedToken) => T): Branch<T> {
  const root: Branch<T> = { kind: 'branch', children: new Map() };
  for (const token of tokens.values()) {
    let node = root;
    const segments = token.path;
    for (const [index, segment] of segments.entries()) {
      if (index === segments.length - 1) {
        if (node.children.has(segment)) {
          throw new Error(`${token.name}: un token no puede ser a la vez grupo y token.`);
        }
        node.children.set(segment, { kind: 'leaf', token, value: pick(token) });
      } else {
        const existing = node.children.get(segment);
        if (existing?.kind === 'leaf') {
          throw new Error(`${existing.token.name}: un token no puede ser a la vez grupo y token.`);
        }
        const child: Branch<T> = existing ?? { kind: 'branch', children: new Map() };
        node.children.set(segment, child);
        node = child;
      }
    }
  }
  return root;
}
