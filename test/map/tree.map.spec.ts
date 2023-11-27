import { pretty } from "@/common";
import { TreeMap } from "@/map";
import { Tree } from "@/tree";

describe("TreeMap tests", () => {
  it("should find tree in path", () => {
    const t1 = new Tree("A");
    t1.add(new Tree("B").add(new Tree("C").add(new Tree("D")))).add(
      new Tree("B1").add(new Tree("C1"))
    );
    const c = new TreeMap(t1);
    const ex = t1.children
      .find((child) => child.id === "B")
      ?.children.find((child) => child.id === "C");
    console.log(c);
    console.log(pretty(t1));
    expect(c.find("A.B.C")).toBe(ex);
  });
});
