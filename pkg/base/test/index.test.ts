import { describe, it, expect } from "vitest";

import { add } from "../src/index.ts";

describe("add", () => {
  it("should add two numbers", () => {
    expect.assertions(1);
    expect(add(1, 2)).toBe(3);
  });
});
