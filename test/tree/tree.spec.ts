import { Tree } from "@/tree";

describe("Tree tests", () => {
  it("should make tree", () => {
    const t1 = new Tree("1");
    t1.add(new Tree("2").add(new Tree("4").add(new Tree("5")))).add(
      new Tree("3").add(new Tree("6"))
    );
    expect(t1.children[1].children[0].id).toBe("6");
  });
});
