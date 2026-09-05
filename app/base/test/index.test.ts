import { describe, expect, it } from "vitest";

import { getAppName } from "../src/index.ts";

describe("getAppName", () => {
  it("should return the app package name", () => {
    expect.assertions(1);
    expect(getAppName()).toBe("@repo/appbase");
  });
});
