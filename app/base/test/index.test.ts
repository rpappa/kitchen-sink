import { describe, expect, it } from "vitest";

import { getAppName } from "../src/index.js";

describe("getAppName", () => {
  it("should return the app package name", () => {
    expect(getAppName()).toEqual("@repo/appbase");
  });
});
