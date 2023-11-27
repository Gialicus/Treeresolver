import { TreeNode } from "./tree.interface";

export const pretty = <R = unknown>(tree: TreeNode<R>) => {
  const recursive = (t: TreeNode<R>, str = "", count = 0) => {
    if (!t.id) return str;
    str += `|${"__".repeat(count)}(${t.id})${
      t.resolved ? " -> " + JSON.stringify(t.resolved) + " " : ""
    }\n`;
    count++;
    for (const t2 of t.children) {
      str = recursive(t2, str, count);
    }
    return str;
  };
  return recursive(tree);
};

export class Tree<R> implements TreeNode<R> {
  resolved: R | null;
  children: Tree<R>[];
  constructor(public id: string) {
    this.resolved = null;
    this.children = [];
  }
  add(tree: Tree<R>) {
    this.children.push(tree);
    return this;
  }
  get(id: string) {
    const rec = (tree: Tree<R>, id: string): Tree<R> | null => {
      if (tree.id === id) return tree;
      if (tree.children.length === 0) return null;
      let founded = tree.children.find((child) => child.id === id) ?? null;
      if (founded) return founded;
      for (const child of tree.children) {
        founded = rec(child, id);
      }
      return founded;
    };
    return rec(this, id);
  }
  async resolve(callback: (id: string) => Promise<R>) {
    this.resolved = await callback(this.id);
    return this;
  }
  async resolveChildrens(callback: (id: string) => Promise<R>) {
    let promises = [];
    for (const child of this.children) {
      promises.push(child.resolve(callback));
    }
    const result = await Promise.all(promises);
    result.forEach((v, i) => (this.children[i] = v));
    return this;
  }
  private async resolveRecursive(
    tree: Tree<R>,
    callback: (id: string) => Promise<R>
  ) {
    let promises = [];
    for (const child of tree.children) {
      promises.push(this.resolveRecursive(child, callback));
    }
    await Promise.all([
      tree.resolve(callback),
      tree.resolveChildrens(callback),
      ...promises,
    ]);
  }
  resolveAll(callback: (id: string) => Promise<R>) {
    return this.resolveRecursive(this, callback);
  }
  private calculateDepthAndQueue(
    tree: Tree<R>,
    depth = 0,
    result: Tree<R>[][] = []
  ) {
    if (!tree.id) {
      return result;
    }

    if (!result[depth]) {
      result[depth] = [];
    }

    result[depth].push(tree);

    if (tree.children && tree.children.length > 0) {
      for (const child of tree.children) {
        this.calculateDepthAndQueue(child, depth + 1, result);
      }
    }

    return result;
  }
  async *resolveLayer(callback: (id: string) => Promise<R>) {
    const queue = this.calculateDepthAndQueue(this);
    for (const chunk of queue) {
      const promises = chunk.map((t) => t.resolve(callback));
      await Promise.all(promises);
      yield this;
    }
    return this;
  }
}
