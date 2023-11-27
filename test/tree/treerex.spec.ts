import { Tree, TreeRex } from "@/tree";
import { setTimeout } from "timers/promises";

describe("TreeRex tests", () => {
  it("should find tree in path", () => {
    const t1 = new Tree("A");
    t1.add(new Tree("B").add(new Tree("C").add(new Tree("D")))).add(
      new Tree("B1").add(new Tree("C1"))
    );
    const rex = new TreeRex(t1);
    const expected = t1.children
      .find((child) => child.id === "B")
      ?.children.find((child) => child.id === "C");
    expect(rex.find("A.B.C")).toStrictEqual(expected);
  });
  it("should find tree in path and resolve", async () => {
    const t1 = new Tree<string>("A");
    t1.add(
      new Tree<string>("B").add(
        new Tree<string>("C").add(new Tree<string>("D"))
      )
    ).add(new Tree<string>("B1").add(new Tree<string>("C1")));
    let rex = new TreeRex<string>(t1);
    await rex.resolveByPath(
      "A.B.C.D",
      async (id) => `Long operation with ID: ${id}`
    );
    expect(rex.find("A")?.resolved).toBe(`Long operation with ID: A`);
    expect(rex.find("A.B")?.resolved).toBe(`Long operation with ID: B`);
    expect(rex.find("A.B.C")?.resolved).toBe(`Long operation with ID: C`);
    expect(rex.find("A.B.C.D")?.resolved).toBe(`Long operation with ID: D`);
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
    const rex = new TreeRex(t1);
    await rex.resolveAll(async (id) => {
      return `Long operation with ID: ${id}`;
    });
    expect(rex.root.children[5].children[3].resolved).toBe(
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
    const rex = new TreeRex(t1);
    const stepper = rex.resolveLayer(async (id) => {
      await setTimeout(200);
      return `Long operation with ID: ${id}`;
    });
    await stepper.next();
    expect(rex.root.resolved).toBe("Long operation with ID: ROOT");
    await stepper.next();
    expect(rex.root.children[0].resolved).toBe("Long operation with ID: A0");
    await stepper.next();
    expect(rex.root.children[0].children[0].resolved).toBe(
      "Long operation with ID: B0"
    );
    await stepper.next();
    expect(rex.root.children[0].children[0].children[0].resolved).toBe(
      "Long operation with ID: C10"
    );
    expect(rex.root.children[0].children[0].children[1].resolved).toBe(
      "Long operation with ID: C20"
    );
    await stepper.next();
    expect(
      rex.root.children[0].children[0].children[1].children[0].resolved
    ).toBe("Long operation with ID: D0");
  });
});
