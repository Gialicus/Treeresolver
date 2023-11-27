import { Tree, calculateDepthAndQueue, createFnBody } from "..";

export class TreeMap<R> {
  private cache: Map<string, Tree<R> | null>;
  constructor(public root: Tree<R>) {
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
  async findAndResolve(path: string, callback: (id: string) => Promise<R>) {
    const funded = this.find(path);
    if (funded) {
      await funded.resolve(callback);
      return true;
    } else {
      return false;
    }
  }
  async resolveByPath(path: string, callback: (id: string) => Promise<R>) {
    if (path.length === 1) return await this.root.resolve(callback);
    const indexes = path.split(".");
    while (indexes.length > 0) {
      await this.findAndResolve(indexes.join("."), callback);
      indexes.pop();
    }
  }
  async *resolveLayer(callback: (id: string) => Promise<R>) {
    const queue = calculateDepthAndQueue(this.root);
    for (const chunk of queue) {
      const promises = chunk.map((t) => t.resolve(callback));
      await Promise.all(promises);
      yield;
    }
    return;
  }
  async resolveAll(callback: (id: string) => Promise<R>) {
    for await (const _ of this.resolveLayer(callback)) {
    }
  }
}
