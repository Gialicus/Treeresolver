export function createFnBody(path: number[]) {
  if (path.length === 0) return "return this.root;";
  let body = "this.root";
  for (const index of path) {
    body += `?.children[${index}]`;
  }
  return `return ${body};`;
}
