import type { AuthClaims } from "@order-platform/shared-types";
import { CognitoJwtVerifier } from "aws-jwt-verify";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      clientId: process.env.COGNITO_CLIENT_ID!,
      tokenUse: "access",
    });
  }
  return verifier;
}

export async function verifyToken(token: string): Promise<AuthClaims> {
  const payload = await getVerifier().verify(token);

  return {
    sub: payload.sub ?? "",
    email_verified:
      (payload as Record<string, unknown>).email_verified === true,
    email: ((payload as Record<string, unknown>).email as string) ?? "",
    groups: (((payload as Record<string, unknown>)[
      "cognito:groups"
    ] as string[]) ?? []) as AuthClaims["groups"],
  };
}
