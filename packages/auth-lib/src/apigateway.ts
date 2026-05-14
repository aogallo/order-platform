import type { AuthClaims, UserGroup } from "@order-platform/shared-types";
import type { APIGatewayProxyEvent } from "aws-lambda";

const VALID_GROUPS: UserGroup[] = ["admin", "operator", "viewer"];

export function extractClaims(event: APIGatewayProxyEvent): AuthClaims | null {
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims?.sub || !claims?.email) return null;

  const rawGroups = claims["cognito:groups"];
  const groups: UserGroup[] = Array.isArray(rawGroups)
    ? rawGroups.filter((g: string): g is UserGroup =>
        VALID_GROUPS.includes(g as UserGroup),
      )
    : [];

  return {
    sub: claims.sub as string,
    email_verified:
      claims.email_verified === "true" || claims.email_verified === true,
    email: claims.email as string,
    groups,
  };
}

export function getUserGroupFromEvent(
  event: APIGatewayProxyEvent,
): UserGroup | null {
  const claims = extractClaims(event);
  if (!claims) return null;
  return claims.groups[0] ?? null;
}
