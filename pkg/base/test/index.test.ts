import { describe, it, expect } from "vitest";

import { add } from "../src/index.ts";

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 2)).toEqual(3);
  });
});
