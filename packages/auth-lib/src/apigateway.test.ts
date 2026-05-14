import { APIGatewayProxyEvent } from "aws-lambda";
import { describe, expect, it } from "vitest";
import { extractClaims, getUserGroupFromEvent } from "./apigateway";

function makeEvent(authorizer?: Record<string, unknown>): APIGatewayProxyEvent {
  return {
    requestContext: {
      authorizer: authorizer ? { claims: authorizer } : undefined,
    },
  } as unknown as APIGatewayProxyEvent;
}

describe("extractClaims", () => {
  const fakeEvent = {
    sub: "usr-123",
    email_verified: true,
    email: "admin@test.com",
    "cognito:groups": ["admin", "viewer"],
  };

  it("extracts claims from a valid API Gateway event", () => {
    const event = makeEvent(fakeEvent);

    const result = extractClaims(event);

    expect(result).toEqual({
      sub: "usr-123",
      email_verified: true,
      email: "admin@test.com",
      groups: ["admin", "viewer"],
    });
  });

  it("returns null when authorizer is missing", () => {
    const event = makeEvent();
    expect(extractClaims(event)).toBeNull();
  });

  it("returns null when sub is missing", () => {
    const event = makeEvent({ email: "test@test.com" });
    expect(extractClaims(event)).toBeNull();
  });

  it("filters out unknown groups", () => {
    const event = makeEvent({
      ...fakeEvent,
      email: "hacker@test.com",
      "cognito:groups": ["operator"],
    });

    const result = extractClaims(event);
    expect(result?.groups).toEqual(["operator"]);
  });
});

describe("getUserGroupFromEvent", () => {
  const fakeEvent = {
    sub: "usr-123",
    email_verified: true,
    email: "admin@test.com",
    "cognito:groups": ["admin", "viewer"],
  };
  it("returns first valid group", () => {
    const event = makeEvent({
      ...fakeEvent,
      email: "op@test.com",
      sub: "usr-890",
      "cognito:groups": ["operator", "viewer"],
    });
    expect(getUserGroupFromEvent(event)).toBe("operator");
  });

  it("returns null when no valid groups", () => {
    const event = makeEvent({
      sub: "usr-0002",
      email_verified: true,
      email: "x@test.com",
      "cognito:groups": ["unknown"],
    });

    expect(getUserGroupFromEvent(event)).toBeNull();
  });
});
