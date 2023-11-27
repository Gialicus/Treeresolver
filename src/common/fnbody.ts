export function createFnBody(key: string, depth: number) {
  if (key.length === 1) return "return this.root;";
  const indexes = key.split(".");
  let body = "this.root";
  for (let d = 1; d <= depth; d++) {
    body += `?.children.find(child => child.id === '${indexes[d]}')`;
  }
  return `return ${body};`;
}
