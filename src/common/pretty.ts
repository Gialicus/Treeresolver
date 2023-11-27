import { TreeNode } from "@/tree";

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
