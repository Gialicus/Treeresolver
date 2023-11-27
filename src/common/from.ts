import { Tree } from "..";

export function from<R = unknown>(tree: Tree<R>) {
  const newTree = new Tree<R>(tree.id);
  newTree.resolved = tree.resolved;
  newTree.children = tree.children.map((child) => from<R>(child));
  return newTree;
}
