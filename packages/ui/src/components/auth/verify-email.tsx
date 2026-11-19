"use client";

import { getAuthCallbackURL } from "@better-auth-ui/core";

import { useAuth, useSendVerificationEmail } from "@better-auth-ui/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "theoui/components/button";
import { Spinner } from "theoui/components/spinner";
import { AuthFormContainer } from "./auth-layout";
import { OpenEmailButton } from "./open-email-button";
import { useIsHydrated } from "./use-is-hydrated";

export type VerifyEmailProps = {
  className?: string;
};

/** Seconds the resend button stays disabled to prevent spamming the endpoint. */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Prompt the user to verify their email, with a resend button
 * that is rate-limited by a cooldown timer.
 *
 * The target email is read from `sessionStorage` (set when sign-up or sign-in
 * redirects here); the OpenEmail/Resend controls are only shown when an email
 * is stored. The resend button is disabled while a cooldown is active and shows
 * the remaining seconds.
 *
 * @param className - Additional CSS classes applied to the verification form
 * @returns The verify-email React element
 */
export function VerifyEmail({ className }: VerifyEmailProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    redirectTo,
    viewPaths,
    Link,
  } = useAuth();

  const isHydrated = useIsHydrated();
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem("better-auth-ui.verify-email")) || "",
  );
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    setEmail(sessionStorage.getItem("better-auth-ui.verify-email") ?? "");
  }, []);

  useEffect(() => {
    if (cooldown <= 0 || !email) return;

    const interval = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown, email]);

  const { mutate: sendVerificationEmail, isPending } = useSendVerificationEmail(
    authClient,
    {
      onSuccess: () => {
        toast.success(localization.auth.verificationEmailSent);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    },
  );

  const isCoolingDown = cooldown > 0;

  return (
    <AuthFormContainer className={className}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {localization.auth.verifyEmail}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {localization.auth.checkYourEmail}
        </p>

        {email && (
          <div className="mt-6 flex flex-col gap-3">
            <OpenEmailButton email={email} />

            <Button
              type="button"
              variant="outline"
              disabled={!email || isCoolingDown || isPending}
              onClick={() =>
                sendVerificationEmail({
                  email,
                  callbackURL: getAuthCallbackURL(baseURL, redirectTo),
                })
              }
            >
              {isPending && <Spinner />}

              {isCoolingDown
                ? localization.auth.resendIn.replace(
                    "{{seconds}}",
                    String(cooldown),
                  )
                : localization.auth.resend}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-center text-xs text-muted-foreground">
          {localization.auth.alreadyVerifiedYourEmail}{" "}
          <Link
            href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
            className="underline underline-offset-4"
          >
            {localization.auth.signIn}
          </Link>
        </p>
      </div>
    </AuthFormContainer>
  );
}
