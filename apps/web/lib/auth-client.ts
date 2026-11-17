import { createAuthClient } from "better-auth/react";
import { agentAuthClient } from "@better-auth/agent-auth/client";
import { apiKeyClient } from "@better-auth/api-key/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { ssoClient } from "@better-auth/sso/client";
import {
  adminClient,
  anonymousClient,
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  phoneNumberClient,
  siweClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    usernameClient(),
    anonymousClient(),
    passkeyClient(),
    twoFactorClient(),
    magicLinkClient(),
    emailOTPClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
    multiSessionClient(),
    apiKeyClient(),
    adminClient(),
    agentAuthClient(),
    oauthProviderClient(),
    lastLoginMethodClient(),
    phoneNumberClient(),
    ssoClient(),
    ...(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      ? [
          oneTapClient({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          }),
        ]
      : []),
    siweClient(),
  ],
});
