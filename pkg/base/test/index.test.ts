import { describe, it, expect } from "vitest";

import { add } from "@repo/pkgbase";

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 2)).toEqual(3);
  });
});
