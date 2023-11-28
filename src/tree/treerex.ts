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
  public root: Tree<ReturnType>;
  constructor(tree: Tree<ReturnType>) {
    this.indexMap = new Map<string, GetThunk<ReturnType>>();
    this.root = from<ReturnType>(tree);
    this.initMap(this.root, [], this.indexMap);
  }
  private initMap(
    node: Tree<ReturnType>,
    currentPath: number[],
    indexMap: Map<string, GetThunk<ReturnType>>
  ) {
    indexMap.set(node.id, this.makeThunk([...currentPath]));
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      this.initMap(child, [...currentPath, i], indexMap);
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
  pretty() {
    return pretty(this.root);
  }
}
