import { pretty } from "@/common";
import { Tree } from "@/tree";

describe("pretty tests", () => {
  it("should pretty tree", () => {
    const t1 = new Tree("1");
    const t2 = new Tree("2").add(new Tree("4").add(new Tree("5")));
    const t3 = new Tree("3").add(new Tree("6").add(new Tree("7")));
    t1.add(t2).add(t3);
    const p = pretty(t1);
    expect(p).toBe(
      `|(1) false\n|__(2) false\n|____(4) false\n|______(5) false\n|__(3) false\n|____(6) false\n|______(7) false\n`
    );
  });
});
