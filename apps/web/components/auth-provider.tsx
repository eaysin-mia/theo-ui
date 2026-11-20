"use client";

import { AuthProvider as CossAuthProvider } from "theoui/auth";
import {
  adminPlugin,
  agentAuthPlugin,
  createAgentAuthClientAdapter,
  anonymousPlugin,
  apiKeyPlugin,
  billingPlugin,
  createDemoBillingAdapter,
  deleteUserPlugin,
  deviceAuthorizationPlugin,
  emailOtpPlugin,
  lastLoginMethodPlugin,
  magicLinkPlugin,
  multiSessionPlugin,
  oauthProviderPlugin,
  oneTapPlugin,
  organizationPlugin,
  passkeyPlugin,
  phoneNumberPlugin,
  createEip1193WalletConnector,
  siwePlugin,
  ssoPlugin,
  themePlugin,
  twoFactorPlugin,
  usernamePlugin,
} from "theoui/auth/lib";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo } from "react";

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
