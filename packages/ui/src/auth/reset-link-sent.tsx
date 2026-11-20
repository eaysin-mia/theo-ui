"use client";

import { getAuthLinkURL } from "@better-auth-ui/core";
import { useAuth } from "@better-auth-ui/react";
import { useEffect, useState } from "react";

import { AuthFormContainer } from "./auth-layout";
import { OpenEmailButton } from "./open-email-button";
import { useIsHydrated } from "./use-is-hydrated";

/** `sessionStorage` key the forgot-password form stores the submitted email under. */
export const RESET_LINK_SENT_STORAGE_KEY = "better-auth-ui.reset-link-sent";

export type ResetLinkSentProps = {
  className?: string;
};

/**
 * Render a confirmation that a password-reset email was sent, with a
 * button to open the user's email provider.
 *
 * The target email is read from `sessionStorage` (set when the forgot-password
 * form redirects here); the OpenEmail button is only shown when an email is
 * stored and resolves to a known provider.
 *
 * @param className - Additional CSS classes applied to the confirmation
 * @returns The reset-link-sent confirmation React element
 */
export function ResetLinkSent({ className }: ResetLinkSentProps) {
  const { basePaths, localization, redirectTo, viewPaths, Link } = useAuth();

  const isHydrated = useIsHydrated();
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(RESET_LINK_SENT_STORAGE_KEY)) || "",
  );

  useEffect(() => {
    setEmail(sessionStorage.getItem(RESET_LINK_SENT_STORAGE_KEY) ?? "");
  }, []);

  return (
    <AuthFormContainer className={className}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {localization.auth.checkYourEmailTitle}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {email
            ? localization.auth.resetLinkSentTo.replace("{{email}}", email)
            : localization.auth.passwordResetEmailSent}
        </p>

        {email && (
          <div className="mt-6 flex flex-col gap-4">
            <OpenEmailButton email={email} />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-center text-xs text-muted-foreground">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={getAuthLinkURL(
              `${basePaths.auth}/${viewPaths.auth.signIn}`,
              redirectTo,
            )}
            className="underline underline-offset-4"
          >
            {localization.auth.signIn}
          </Link>
        </p>
      </div>
    </AuthFormContainer>
  );
}
