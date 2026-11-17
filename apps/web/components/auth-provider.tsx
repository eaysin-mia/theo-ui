"use client";

import { AuthProvider as CossAuthProvider } from "@workspace/ui/components/auth/auth-provider";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo } from "react";

// Coss UI Auth Plugins from packages/ui
import { adminPlugin } from "@workspace/ui/lib/auth/admin-plugin";
import {
  agentAuthPlugin,
  createAgentAuthClientAdapter,
} from "@workspace/ui/lib/auth/agent-auth-plugin";
import { anonymousPlugin } from "@workspace/ui/lib/auth/anonymous-plugin";
import { apiKeyPlugin } from "@workspace/ui/lib/auth/api-key-plugin";
import {
  billingPlugin,
  createDemoBillingAdapter,
} from "@workspace/ui/lib/auth/billing-plugin";
import { deleteUserPlugin } from "@workspace/ui/lib/auth/delete-user-plugin";
import { deviceAuthorizationPlugin } from "@workspace/ui/lib/auth/device-authorization-plugin";
import { emailOtpPlugin } from "@workspace/ui/lib/auth/email-otp-plugin";
import { lastLoginMethodPlugin } from "@workspace/ui/lib/auth/last-login-method-plugin";
import { magicLinkPlugin } from "@workspace/ui/lib/auth/magic-link-plugin";
import { multiSessionPlugin } from "@workspace/ui/lib/auth/multi-session-plugin";
import { oauthProviderPlugin } from "@workspace/ui/lib/auth/oauth-provider-plugin";
import { organizationPlugin } from "@workspace/ui/lib/auth/organization-plugin";
import { passkeyPlugin } from "@workspace/ui/lib/auth/passkey-plugin";
import { phoneNumberPlugin } from "@workspace/ui/lib/auth/phone-number-plugin";
import {
  createEip1193WalletConnector,
  siwePlugin,
} from "@workspace/ui/lib/auth/siwe-plugin";
import { ssoPlugin } from "@workspace/ui/lib/auth/sso-plugin";
import { oneTapPlugin } from "@workspace/ui/lib/auth/one-tap-plugin";
import { themePlugin } from "@workspace/ui/lib/auth/theme-plugin";
import { twoFactorPlugin } from "@workspace/ui/lib/auth/two-factor-plugin";
import { usernamePlugin } from "@workspace/ui/lib/auth/username-plugin";

const normalizeParam = (param: string | string[] | undefined) =>
  (Array.isArray(param) ? param[0] : param)?.replace(/^@/, "") ?? null;

export function AppAuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();

  const slugFromParam = normalizeParam(params?.slug);
  const segments = Array.isArray(params?.path) ? params.path : [];
  const slugFromPath =
    segments.length > 1 ? segments[0]?.replace(/^@/, "") : null;
  const slug = slugFromParam ?? slugFromPath ?? undefined;

  const agentAuthAdapter = useMemo(
    () => createAgentAuthClientAdapter(authClient),
    [],
  );

  const siweConnector = useMemo(() => createEip1193WalletConnector(), []);
  const billingAdapter = useMemo(() => createDemoBillingAdapter(), []);

  const plugins = useMemo(
    () => [
      adminPlugin(),
      agentAuthPlugin({ adapter: agentAuthAdapter }),
      anonymousPlugin(),
      apiKeyPlugin({ organization: true }),
      billingPlugin({
        adapter: billingAdapter,
        user: true,
        organization: true,
      }),
      deleteUserPlugin(),
      deviceAuthorizationPlugin(),
      emailOtpPlugin({
        signIn: true,
        emailVerification: true,
        passwordReset: true,
        changeEmail: true,
      }),
      lastLoginMethodPlugin(),
      magicLinkPlugin(),
      multiSessionPlugin(),
      oauthProviderPlugin({
        clientManagement: true,
      }),
      organizationPlugin({
        slugPrefix: "@",
        slug,
        teams: true,
      }),
      passkeyPlugin(),
      phoneNumberPlugin({
        signIn: true,
        passwordSignIn: true,
        passwordReset: true,
        changePhoneNumber: true,
      }),
      ssoPlugin({
        emailFirst: false,
        organization: true,
      }),
      ...(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? [oneTapPlugin()] : []),
      siwePlugin({
        connector: siweConnector,
        domain:
          typeof window !== "undefined"
            ? window.location.host
            : "localhost:3000",
        uri:
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000",
      }),
      themePlugin({ useTheme: () => theme }),
      twoFactorPlugin(),
      usernamePlugin(),
    ],
    [theme, slug, agentAuthAdapter, siweConnector, billingAdapter],
  );

  return (
    <CossAuthProvider
      authClient={authClient}
      Link={Link}
      emailAndPassword={{
        strengthMeter: true,
        minPasswordLength: 8,
      }}
      socialProviders={["github", "google"]}
      navigate={({ to, replace }) => {
        if (replace) {
          router.replace(to);
        } else {
          router.push(to);
        }
      }}
      basePaths={{
        auth: "/auth",
        settings: "/settings",
        organization: "/organization",
      }}
      plugins={plugins}
    >
      {children}
    </CossAuthProvider>
  );
}
