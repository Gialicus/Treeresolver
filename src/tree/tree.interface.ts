export interface TreeNode<ReturnType> {
  id: string;
  done: boolean;
  resolved?: ReturnType;
  children: TreeNode<ReturnType>[];
}

export type ResolveCallback<ReturnType> = (
  tree: TreeNode<ReturnType>
) => Promise<ReturnType>;
