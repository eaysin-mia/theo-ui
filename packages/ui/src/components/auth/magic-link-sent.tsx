"use client";

import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useEffect, useState } from "react";

import { magicLinkPlugin } from "theoui/lib/auth/magic-link-plugin";
import { AuthFormContainer } from "./auth-layout";
import { OpenEmailButton } from "./open-email-button";
import { useIsHydrated } from "./use-is-hydrated";

/** `sessionStorage` key the magic-link form stores the submitted email under. */
export const MAGIC_LINK_SENT_STORAGE_KEY = "better-auth-ui.magic-link-sent";

export type MagicLinkSentProps = {
  className?: string;
};

/**
 * Render a confirmation that a magic-link email was sent, with a button
 * to open the user's email provider.
 *
 * The target email is read from `sessionStorage` (set when the magic-link
 * form redirects here); the OpenEmail button is only shown when an email is
 * stored and resolves to a known provider.
 *
 * @param className - Additional CSS classes applied to the confirmation
 * @returns The magic-link-sent confirmation React element
 */
export function MagicLinkSent({ className }: MagicLinkSentProps) {
  const { basePaths, emailAndPassword, localization, viewPaths, Link } =
    useAuth();
  const { localization: magicLinkLocalization } =
    useAuthPlugin(magicLinkPlugin);

  const isHydrated = useIsHydrated();
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY)) || "",
  );

  useEffect(() => {
    setEmail(sessionStorage.getItem(MAGIC_LINK_SENT_STORAGE_KEY) ?? "");
  }, []);

  return (
    <AuthFormContainer className={className}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {localization.auth.checkYourEmailTitle}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {email
            ? magicLinkLocalization.magicLinkSentTo.replace("{{email}}", email)
            : magicLinkLocalization.magicLinkSent}
        </p>

        {email && (
          <div className="mt-6 flex flex-col gap-4">
            <OpenEmailButton email={email} />
          </div>
        )}

        {emailAndPassword?.enabled && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-center text-xs text-muted-foreground">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthFormContainer>
  );
}
