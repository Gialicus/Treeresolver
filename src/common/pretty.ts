import { TreeNode } from "..";

export const pretty = <R = unknown>(tree: TreeNode<R>, full = false) => {
  const recursive = (t: TreeNode<R>, str = "", count = 0) => {
    if (!t.id) return str;
    str += `|${"__".repeat(count)}(${t.id})${
      full
        ? t.resolved
          ? " -> " + JSON.stringify(t.resolved) + " "
          : " " + t.done
        : " " + t.done
    }\n`;
    count++;
    for (const t2 of t.children) {
      str = recursive(t2, str, count);
    }
    return str;
  };
  return recursive(tree);
};
