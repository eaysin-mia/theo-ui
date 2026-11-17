"use client";

import { use } from "react";
import Link from "next/link";
import { Auth, AuthLayout } from "@theo/ui/auth";

const HEADER_ACTIONS: Record<
  string,
  { text?: string; actionLabel?: string; href?: string }
> = {
  "sign-in": {
    text: "New to Theo UI?",
    actionLabel: "Create a workspace",
    href: "/auth/sign-up",
  },
  "sign-up": {
    text: "Already using Theo UI?",
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
        name: "Theo UI",
        href: "/",
      }}
      headerAction={headerAction}
      renderLink={({ href, children, ...props }) => (
        <Link href={href} {...props}>
          {children}
        </Link>
      )}
    >
      <Auth path={resolvedPath} />
    </AuthLayout>
  );
}
