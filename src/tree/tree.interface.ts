export interface TreeNode<R> {
  id: string;
  resolved: R | null;
  children: TreeNode<R>[];
}
