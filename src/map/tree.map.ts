import { Tree } from "..";

export class TreeMap<R> {
  private cache: Map<string, Tree<R> | null>;
  constructor(private root: Tree<R>) {
    this.cache = new Map<string, Tree<R> | null>();
    this.buildTreeMap(this.root);
  }
  private buildTreeMap(node: Tree<R>, path = "", depth = 0) {
    if (!node) {
      return this.cache;
    }
    const currentPath = path === "" ? `${node.id}` : `${path}.${node.id}`;
    this.cache.set(currentPath, this.runGetter(currentPath, depth));
    depth += 1;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.buildTreeMap(child, currentPath, depth);
      }
    }
  }
  private createFnBody(key: string, depth: number) {
    if (key.length === 1) return "return this.root;";
    const indexes = key.split(".");
    let body = "this.root";
    for (let d = 1; d <= depth; d++) {
      body += `?.children.find(child => child.id === '${indexes[d]}')`;
    }
    return `return ${body};`;
  }
  private runGetter(key: string, depth: number) {
    const fn = new Function(this.createFnBody(key, depth)).bind(this);
    const result = fn();
    return result as Tree<R>;
  }
  find(path: string) {
    return this.cache.get(path) ?? null;
  }
}
