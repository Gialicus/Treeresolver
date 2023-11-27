import { from } from "@/common";
import { Tree } from "@/tree";

describe("From tests", () => {
  it("should make new tree from tree", () => {
    const t1 = new Tree("1");
    t1.add(new Tree("2").add(new Tree("4").add(new Tree("5")))).add(
      new Tree("3").add(new Tree("6"))
    );
    expect(from(t1)).toStrictEqual(t1);
  });
});
