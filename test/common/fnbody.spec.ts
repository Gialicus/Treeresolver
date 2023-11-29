import { createFnBody } from "@/common";

describe("fnBody tests", () => {
  it("should create function body", () => {
    let body = createFnBody([0, 1]);
    expect(body).toStrictEqual("return this.root?.children[0]?.children[1];");
    body = createFnBody([5]);
    expect(body).toStrictEqual("return this.root?.children[5];");
    body = createFnBody([]);
    expect(body).toStrictEqual("return this.root;");
  });
});
