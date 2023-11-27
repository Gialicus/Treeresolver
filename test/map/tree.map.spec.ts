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
    expect(c.find("A.B.C")).toBe(ex);
  });
  it("should find tree in path and resolve", async () => {
    const t1 = new Tree<string>("A");
    t1.add(
      new Tree<string>("B").add(
        new Tree<string>("C").add(new Tree<string>("D"))
      )
    ).add(new Tree<string>("B1").add(new Tree<string>("C1")));
    let map = new TreeMap<string>(t1);
    await map.resolveByPath(
      "A.B.C",
      async (id) => `Long operation with ID: ${id}`
    );
    expect(map.find("A")?.resolved).toBe(`Long operation with ID: A`);
    expect(map.find("A.B")?.resolved).toBe(`Long operation with ID: B`);
    expect(map.find("A.B.C")?.resolved).toBe(`Long operation with ID: C`);
  });
});
