import { TreeNode } from "./tree.interface";
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
  async resolve(callback: (id: string) => Promise<R>) {
    this.resolved = await callback(this.id);
    return this;
  }
  async resolveChildren(callback: (id: string) => Promise<R>) {
    let queue = [];
    for (let i = 0; i < this.children.length; i++) {
      queue.push(this.children[i].resolve(callback));
    }
    await Promise.all(queue);
    return this;
  }
}
