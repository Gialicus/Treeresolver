import { Tree } from "@/tree";

export function calculateDepthAndQueue<R = unknown>(
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
      calculateDepthAndQueue<R>(child, depth + 1, result);
    }
  }

  return result.filter((chunck) => chunck.length !== 0);
}
