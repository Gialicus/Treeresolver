import { TreeMap } from "@/map";
import { Tree } from "@/tree";

describe("TreeMap tests", () => {
  it("should find tree in path", () => {
    const t1 = new Tree("A");
    t1.add(new Tree("B").add(new Tree("C").add(new Tree("D")))).add(
      new Tree("B1").add(new Tree("C1"))
    );
    const map = new TreeMap(t1);
    const expected = t1.children
      .find((child) => child.id === "B")
      ?.children.find((child) => child.id === "C");
    expect(map.find("A.B.C")).toStrictEqual(expected);
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
  it("should resolve all tree", async () => {
    const t1 = new Tree("ROOT");
    for (let i = 0; i < 10; i++) {
      const t2 = new Tree("" + i);
      for (let j = 0; j < 5; j++) {
        t2.add(new Tree("" + j).add(new Tree("" + (j + 1))));
      }
      t1.add(t2);
    }
    const tm1 = new TreeMap(t1);
    await tm1.resolveAll(async (id) => {
      return `Long operation with ID: ${id}`;
    });
    expect(tm1.root.children[5].children[3].resolved).toBe(
      "Long operation with ID: 3"
    );
  });

  it("should resolve all layer in tree step by step", async () => {
    const t1 = new Tree("ROOT");
    for (let i = 0; i < 5; i++) {
      const t2 = new Tree("A" + i);
      for (let j = 0; j < 3; j++) {
        t2.add(
          new Tree("B" + j)
            .add(new Tree("C1" + j))
            .add(new Tree("C2" + j).add(new Tree("D" + j)))
        );
      }
      t1.add(t2);
    }
    const tm1 = new TreeMap(t1);
    const stepper = tm1.resolveLayer(async (id) => {
      return `Long operation with ID: ${id}`;
    });
    await stepper.next();
    expect(tm1.root.resolved).toBe("Long operation with ID: ROOT");
    await stepper.next();
    expect(tm1.root.children[0].resolved).toBe("Long operation with ID: A0");
    await stepper.next();
    expect(tm1.root.children[0].children[0].resolved).toBe(
      "Long operation with ID: B0"
    );
    await stepper.next();
    expect(tm1.root.children[0].children[0].children[0].resolved).toBe(
      "Long operation with ID: C10"
    );
    expect(tm1.root.children[0].children[0].children[1].resolved).toBe(
      "Long operation with ID: C20"
    );
    await stepper.next();
    expect(
      tm1.root.children[0].children[0].children[1].children[0].resolved
    ).toBe("Long operation with ID: D0");
  });
});
