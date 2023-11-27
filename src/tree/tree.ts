import { calculateDepthAndQueue } from "@/common";
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
  async *resolveLayer(callback: (id: string) => Promise<R>) {
    const queue = calculateDepthAndQueue(this);
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
