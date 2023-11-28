export interface TreeNode<ReturnType> {
  id: string;
  done: boolean;
  resolved?: ReturnType;
  children: TreeNode<ReturnType>[];
}

export type ResolveCallback<ReturnType> = (id: string) => Promise<ReturnType>;
