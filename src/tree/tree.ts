import { ResolveCallback, TreeNode } from "./tree.interface";
export class Tree<ReturnType> implements TreeNode<ReturnType> {
  resolved?: ReturnType;
  done: boolean;
  children: Tree<ReturnType>[];
  constructor(public id: string) {
    this.resolved = undefined;
    this.done = false;
    this.children = [];
  }
  add(tree: Tree<ReturnType>) {
    this.children.push(tree);
    return this;
  }
  flat() {
    const flatInner = (tree: Tree<ReturnType>, ids: string[] = []) => {
      if (!tree) return ids;
      ids.push(tree.id);
      for (const child of tree.children) {
        ids.concat(flatInner(child, ids));
      }
      return ids;
    };
    return flatInner(this, []);
  }
  async resolve(callback: ResolveCallback<ReturnType>) {
    this.resolved = await callback(this);
    this.done = true;
    return this;
  }
  async resolveChildren(callback: ResolveCallback<ReturnType>) {
    let queue = [];
    for (let i = 0; i < this.children.length; i++) {
      queue.push(this.children[i].resolve(callback));
    }
    await Promise.all(queue);
    return this;
  }
}
