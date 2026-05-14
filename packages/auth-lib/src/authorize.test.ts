import { describe, it, expect } from "vitest";
import type { AuthClaims } from "@order-platform/shared-types";
import { authorize, hasGroup, requireGroup } from "./authorize";

const operatorClaims: AuthClaims = {
  sub: "usr_001",
  email_verified: true,
  email: "operator@test.com",
  groups: ["operator"],
};

const adminClains: AuthClaims = {
  sub: "usr_002",
  email_verified: true,
  email: "admin@test.com",
  groups: ["admin", "viewer"],
};

describe("hasGroup", () => {
  it("returns true when claims contain the group", () => {
    expect(hasGroup(operatorClaims, "operator")).toBe(true);
  });
  it("returns false when claims do not contain the group", () => {
    expect(hasGroup(operatorClaims, "admin")).toBe(false);
  });
});

describe("requireGroup", () => {
  it("returns true for matching group", () => {
    expect(requireGroup(adminClains, "admin")).toBe(true);
  });
  it("returns false for non-matching group", () => {
    expect(requireGroup(operatorClaims, "admin")).toBe(false);
  });
});

describe("authorize", () => {
  it("returns true when any required group matches", () => {
    expect(authorize(operatorClaims, ["operator"])).toBe(true);
    expect(authorize(operatorClaims, ["operator", "admin"])).toBe(true);
  });
  it("returns false when no required group matches", () => {
    expect(authorize(operatorClaims, ["admin"])).toBe(false);
  });
  it("returns false for empty groups", () => {
    expect(authorize(operatorClaims, [])).toBe(false);
  });
});
