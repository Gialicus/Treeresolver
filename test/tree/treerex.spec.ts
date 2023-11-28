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
    expect(rex.find("C")).toStrictEqual(expected);
  });
  it("should find and resolve tree", async () => {
    const t1 = new Tree<string>("A");
    t1.add(
      new Tree<string>("B").add(
        new Tree<string>("C").add(new Tree<string>("D"))
      )
    ).add(new Tree<string>("B1").add(new Tree<string>("C1")));
    let rex = new TreeRex<string>(t1);
    await rex.findAndResolve(
      "D",
      async (t) => `Long operation with ID: ${t.id}`
    );
    expect(rex.find("D")?.resolved).toBe(`Long operation with ID: D`);
  });
  it("should find and resolve tree children", async () => {
    const t1 = new Tree<string>("A");
    t1.add(
      new Tree<string>("B").add(
        new Tree<string>("C").add(new Tree<string>("D"))
      )
    ).add(new Tree<string>("B1").add(new Tree<string>("C1")));
    let rex = new TreeRex<string>(t1);
    await rex.findAndResolveChildren(
      "A",
      async (t) => `Long operation with ID: ${t.id}`
    );
    expect(rex.find("A")?.children[0].resolved).toBe(
      `Long operation with ID: B`
    );
    expect(rex.find("A")?.children[1].resolved).toBe(
      `Long operation with ID: B1`
    );
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
    await rex.resolveAll(async (t) => {
      return `Long operation with ID: ${t.id}`;
    });
    expect(rex.root.children[5].children[3].resolved).toBe(
      "Long operation with ID: 3"
    );
  });
  it("should resolve all layer in tree step by step", async () => {
    const cto = new Tree<string>("CTO");
    const architect1 = new Tree<string>("ARCHITECT_1");
    const architect2 = new Tree<string>("ARCHITECT_2");
    const dev1 = new Tree<string>("DEV_1");
    const dev2 = new Tree<string>("DEV_2");
    const dev3 = new Tree<string>("DEV_3");
    const dev4 = new Tree<string>("DEV_4");
    const dev5 = new Tree<string>("DEV_5");
    const dev6 = new Tree<string>("DEV_6");
    architect1.add(dev1).add(dev2).add(dev3);
    architect2.add(dev4).add(dev5).add(dev6);
    cto.add(architect1).add(architect2);
    const rex = new TreeRex(cto);
    const stepper = rex.resolveLayer(async (tree) => {
      await setTimeout(200);
      return `Long operation with ID: ${tree.id}`;
    });
    await stepper.next();
    expect(rex.root.resolved).toBe("Long operation with ID: CTO");
    await stepper.next();
    expect(rex.root.children[0].resolved).toBe(
      "Long operation with ID: ARCHITECT_1"
    );
    expect(rex.root.children[1].resolved).toBe(
      "Long operation with ID: ARCHITECT_2"
    );
    await stepper.next();
    expect(rex.root.children[0].children[0].resolved).toBe(
      "Long operation with ID: DEV_1"
    );
    expect(rex.root.children[0].children[1].resolved).toBe(
      "Long operation with ID: DEV_2"
    );
    expect(rex.root.children[0].children[2].resolved).toBe(
      "Long operation with ID: DEV_3"
    );
    expect(rex.root.children[1].children[0].resolved).toBe(
      "Long operation with ID: DEV_4"
    );
    expect(rex.root.children[1].children[1].resolved).toBe(
      "Long operation with ID: DEV_5"
    );
    expect(rex.root.children[1].children[2].resolved).toBe(
      "Long operation with ID: DEV_6"
    );
  });

  it("should find index path by id in tree", async () => {
    const cto = new Tree<string>("CTO");
    const architect1 = new Tree<string>("ARCHITECT_1");
    const architect2 = new Tree<string>("ARCHITECT_2");
    const dev1 = new Tree<string>("DEV_1");
    const dev2 = new Tree<string>("DEV_2");
    const dev3 = new Tree<string>("DEV_3");
    const dev4 = new Tree<string>("DEV_4");
    const dev5 = new Tree<string>("DEV_5");
    const dev6 = new Tree<string>("DEV_6");
    architect1.add(dev1).add(dev2).add(dev3);
    architect2.add(dev4).add(dev5).add(dev6);
    cto.add(architect1).add(architect2);
    const rex = new TreeRex(cto);
    expect(rex.findPath("DEV_3")).toStrictEqual([
      "CTO",
      "ARCHITECT_1",
      "DEV_3",
    ]);
    expect(rex.findPath("CTO")).toStrictEqual(["CTO"]);
  });
});
