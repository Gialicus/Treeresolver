import { createCache } from "async-cache-dedupe";
import { Tree, calculateDepthAndQueue, createFnBody, from, pretty } from "..";

type CacheOptions = Parameters<typeof createCache>[0];
type GetThunk<R> = () => Tree<R> | null;
export class TreeRex<R> {
  private indexMap: Map<string, GetThunk<R>>;
  public root: Tree<R>;
  constructor(tree: Tree<R>, private options?: CacheOptions) {
    this.indexMap = new Map<string, GetThunk<R>>();
    this.root = from<R>(tree);
    this.init(this.root);
  }
  private init(node: Tree<R>, path = "", depth = 0) {
    if (!node) {
      return this.indexMap;
    }
    const currentPath = path === "" ? `${node.id}` : `${path}.${node.id}`;
    this.indexMap.set(currentPath, this.makeThunk(currentPath, depth));
    depth += 1;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.init(child, currentPath, depth);
      }
    }
  }
  private makeThunk(key: string, depth: number) {
    const fn = new Function(createFnBody(key, depth)).bind(this);
    return fn as () => Tree<R> | null;
  }
  find(path: string) {
    let thunk = this.indexMap.get(path);
    if (thunk) {
      return thunk() ?? null;
    } else {
      return null;
    }
  }
  async findAndResolve(path: string, callback: (id: string) => Promise<R>) {
    const funded = this.find(path);
    if (!funded) return;
    await funded.resolve(callback);
  }
  async resolveByPath(path: string, callback: (id: string) => Promise<R>) {
    if (path.length === 1) await this.root.resolve(callback);
    const indexes = path.split(".");
    while (indexes.length > 0) {
      await this.findAndResolve(indexes.join("."), callback);
      indexes.pop();
    }
  }
  async *resolveLayer(
    callback: (id: string) => Promise<R>
  ): AsyncGenerator<void, void, unknown> {
    const queue = calculateDepthAndQueue(this.root);
    const cache = createCache(
      this.options ?? {
        ttl: 5, // seconds
        storage: { type: "memory" },
      }
    );
    const chacheIstance = cache.define("resolve", callback);
    for (const chunk of queue) {
      const promises = chunk.map((t) => t.resolve(chacheIstance.resolve));
      await Promise.all(promises);
      yield;
    }
    return;
  }
  async resolveAll(callback: (id: string) => Promise<R>) {
    for await (const _ of this.resolveLayer(callback)) {
    }
  }
  pretty() {
    return pretty(this.root);
  }
}
