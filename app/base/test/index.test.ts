import { describe, expect, it } from "vitest";

import { getAppName } from "@repo/appbase";

describe("getAppName", () => {
  it("should return the app package name", () => {
    expect(getAppName()).toEqual("@repo/appbase");
  });
});
