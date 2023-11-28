import {
  ResolveCallback,
  Tree,
  calculateDepthAndQueue,
  createFnBody,
  from,
  pretty,
} from "..";

type GetThunk<R> = () => Tree<R> | null;
export class TreeRex<ReturnType> {
  private indexMap: Map<string, GetThunk<ReturnType>>;
  private materilizedPath: Map<string, string>;
  public root: Tree<ReturnType>;
  constructor(tree: Tree<ReturnType>) {
    this.indexMap = new Map<string, GetThunk<ReturnType>>();
    this.materilizedPath = new Map<string, string>();
    this.root = from<ReturnType>(tree);
    this.initMap(this.root, "", []);
  }
  private initMap(
    node: Tree<ReturnType>,
    currentKey: string,
    currentPath: number[]
  ) {
    const key = currentKey ? `${currentKey}|${node.id}` : node.id;
    this.materilizedPath.set(node.id, key);
    this.indexMap.set(node.id, this.makeThunk([...currentPath]));
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      this.initMap(child, key, [...currentPath, i]);
    }
  }
  private makeThunk(path: number[]) {
    const fn = new Function(createFnBody(path)).bind(this);
    return fn as () => Tree<ReturnType> | null;
  }
  find(id: string) {
    if (id === this.root.id) return this.root;
    let thunk = this.indexMap.get(id);
    if (thunk) {
      return thunk() ?? null;
    } else {
      return null;
    }
  }
  findPath(id: string) {
    if (!this.materilizedPath.has(id)) return [];
    return this.materilizedPath.get(id)?.split("|");
  }
  async findAndResolve(id: string, callback: ResolveCallback<ReturnType>) {
    const funded = this.find(id);
    if (!funded) return;
    await funded.resolve(callback);
  }
  async findAndResolveChildren(
    id: string,
    callback: ResolveCallback<ReturnType>
  ) {
    const funded = this.find(id);
    if (!funded) return;
    await funded.resolveChildren(callback);
  }
  async *resolveLayer(
    callback: ResolveCallback<ReturnType>
  ): AsyncGenerator<void, void, unknown> {
    const queue = calculateDepthAndQueue(this.root);
    for (const chunk of queue) {
      const promises = chunk.map((t) => t.resolve(callback));
      await Promise.all(promises);
      yield;
    }
    return;
  }
  async resolveAll(callback: ResolveCallback<ReturnType>) {
    for await (const _ of this.resolveLayer(callback)) {
    }
  }
  pretty(showResolvedValue = false) {
    return pretty(this.root, showResolvedValue);
  }
}
