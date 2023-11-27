import { pretty } from "@/common";
import { Tree } from "@/tree";
import { setTimeout } from "timers/promises";

describe("Tree tests", () => {
  it("should make tree", () => {
    const t1 = new Tree("1");
    t1.add(new Tree("2").add(new Tree("4").add(new Tree("5")))).add(
      new Tree("3").add(new Tree("6"))
    );
    expect(t1.children[1].children[0].id).toBe("6");
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
    await t1.resolveAll(async (id) => {
      await setTimeout(200);
      return `Long operation with ID:${id}`;
    });
    expect(t1.children[5].children[3].resolved).toBe(
      "Long operation with ID:3"
    );
  });
  it("should pretty tree", () => {
    const t1 = new Tree("1");
    const t2 = new Tree("2").add(new Tree("4").add(new Tree("5")));
    const t3 = new Tree("3").add(new Tree("6").add(new Tree("7")));
    t1.add(t2).add(t3);
    const p = pretty(t1);
    expect(p).toBe(
      `|(1)\n|__(2)\n|____(4)\n|______(5)\n|__(3)\n|____(6)\n|______(7)\n`
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
    const stepper = t1.resolveLayer(async (id) => {
      await setTimeout(200);
      return `Long operation with ID: ${id}`;
    });
    await stepper.next();
    expect(t1.resolved).toBe("Long operation with ID: ROOT");
    await stepper.next();
    expect(t1.children[0].resolved).toBe("Long operation with ID: A0");
    await stepper.next();
    expect(t1.children[0].children[0].resolved).toBe(
      "Long operation with ID: B0"
    );
    await stepper.next();
    expect(t1.children[0].children[0].children[0].resolved).toBe(
      "Long operation with ID: C10"
    );
    expect(t1.children[0].children[0].children[1].resolved).toBe(
      "Long operation with ID: C20"
    );
    await stepper.next();
    expect(t1.children[0].children[0].children[1].children[0].resolved).toBe(
      "Long operation with ID: D0"
    );
  });
});
