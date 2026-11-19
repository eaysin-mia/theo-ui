"use client";

import { use } from "react";
import Link from "next/link";
import { Auth } from "theo-ui/components/auth/auth";
import {
  AuthLayout,
  AuthLegalNotice,
} from "theo-ui/components/auth/auth-layout";

const HEADER_ACTIONS: Record<
  string,
  { text?: string; actionLabel?: string; href?: string }
> = {
  "sign-in": {
    text: "Not on ReUI yet?",
    actionLabel: "Create a workspace",
    href: "/auth/sign-up",
  },
  "sign-up": {
    text: "Already have an account?",
    actionLabel: "Sign in",
    href: "/auth/sign-in",
  },
  "forgot-password": {
    text: "Remember your password?",
    actionLabel: "Sign in",
    href: "/auth/sign-in",
  },
  "reset-password": {
    text: "Remember your password?",
    actionLabel: "Sign in",
    href: "/auth/sign-in",
  },
  "verify-email": {
    text: "Back to sign in",
    actionLabel: "Sign in",
    href: "/auth/sign-in",
  },
};

export default function AuthCatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = use(params);
  const resolvedPath = path?.join("/") ?? "sign-in";
  const headerAction = HEADER_ACTIONS[resolvedPath] ?? {
    text: "Back to sign in",
    actionLabel: "Sign in",
    href: "/auth/sign-in",
  };

  return (
    <AuthLayout
      brand={{
        name: "ReUI",
        href: "/",
      }}
      headerAction={headerAction}
      renderLink={({ href, children, ...props }) => (
        <Link href={href} {...props}>
          {children}
        </Link>
      )}
      legalNotice={<AuthLegalNotice appName="ReUI" />}
    >
      <Auth path={resolvedPath} />
    </AuthLayout>
  );
}
