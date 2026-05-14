import type { AuthClaims, UserGroup } from "@order-platform/shared-types";

export function hasGroup(claims: AuthClaims, group: UserGroup): boolean {
  return claims.groups.includes(group);
}

export function requireGroup(claims: AuthClaims, group: UserGroup): boolean {
  return hasGroup(claims, group);
}

export function authorize(
  claims: AuthClaims,
  requireGroups: UserGroup[],
): boolean {
  if (requireGroups.length === 0) return false;
  return requireGroups.some((group) => hasGroup(claims, group));
}
