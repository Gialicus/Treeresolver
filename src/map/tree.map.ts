import { Tree, createFnBody } from "..";

export class TreeMap<R> {
  private cache: Map<string, Tree<R> | null>;
  constructor(private root: Tree<R>) {
    this.cache = new Map<string, Tree<R> | null>();
    this.init(this.root);
  }
  private init(node: Tree<R>, path = "", depth = 0) {
    if (!node) {
      return this.cache;
    }
    const currentPath = path === "" ? `${node.id}` : `${path}.${node.id}`;
    this.cache.set(currentPath, this.runGetter(currentPath, depth));
    depth += 1;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.init(child, currentPath, depth);
      }
    }
  }
  private runGetter(key: string, depth: number) {
    const fn = new Function(createFnBody(key, depth)).bind(this);
    const result = fn();
    return result as Tree<R>;
  }
  find(path: string) {
    return this.cache.get(path) ?? null;
  }
}
