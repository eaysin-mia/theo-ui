"use client";

import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core";
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import {
  useSendVerificationOtp,
  useVerifyEmailOtp,
} from "@better-auth-ui/react/plugins/email-otp";
import { useSelector } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@theo/ui/components/button";
import { Field, FieldLabel } from "@theo/ui/components/field";
import { Input } from "@theo/ui/components/input";
import { emailOtpPlugin } from "@theo/ui/lib/auth/email-otp-plugin";
import {
  RESEND_COOLDOWN_SECONDS,
  useResendCooldown,
} from "@theo/ui/lib/auth/use-resend-cooldown";
import {
  isAuthFormFieldInvalid,
  runAuthFormAction,
  submitAuthForm,
  useAuthForm,
} from "../auth-form";
import { AuthFormContainer } from "../auth-layout";
import { OpenEmailButton } from "../open-email-button";
import { OtpField } from "../otp-field";
import { useIsHydrated } from "../use-is-hydrated";

/** `sessionStorage` key the sign-up and sign-in flows store the pending address under. */
export const VERIFY_EMAIL_STORAGE_KEY = "better-auth-ui.verify-email";

export type VerifyEmailOtpProps = {
  className?: string;
};

/**
 * Verify an email address with a code instead of a link.
 *
 * Replaces the built-in `<VerifyEmail />` view when the email-OTP plugin runs
 * with `emailVerification: true`. The address comes from session storage when
 * sign-up or sign-in put it there; otherwise the user types it and requests a
 * code. Sign-up already triggered a send, so the resend button starts on
 * cooldown just like the link-based view.
 *
 * @param className - Additional CSS classes applied to the form container.
 */
export function VerifyEmailOtp({ className }: VerifyEmailOtpProps) {
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    redirectTo,
    viewPaths,
    Link,
  } = useAuth();
  const { localization: emailOtpLocalization, otpLength } =
    useAuthPlugin(emailOtpPlugin);

  const otpClient = authClient as EmailOtpAuthClient;
  const isHydrated = useIsHydrated();

  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY)) || "",
  );

  const { cooldown, isCoolingDown, startCooldown } = useResendCooldown();

  // Sign-up already sent a code to this address, so restoring it also starts
  // the cooldown — otherwise the hydrated render would offer an immediate
  // resend and walk straight into the server's rate limit.
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY) ?? "";
    setEmail(pendingEmail);

    if (pendingEmail) startCooldown(RESEND_COOLDOWN_SECONDS);
  }, [startCooldown]);

  const { mutateAsync: sendVerificationOtp, isPending: isSending } =
    useSendVerificationOtp(otpClient, {
      onSuccess: (_data, { email: sentTo }) => {
        sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, sentTo);
        setEmail(sentTo);
        startCooldown();
        toast.success(emailOtpLocalization.codeSent);
      },
    });

  const { mutateAsync: verifyEmailOtp, isPending: isVerifying } =
    useVerifyEmailOtp(otpClient, {
      onError: () => form.setFieldValue("code", ""),
      onSuccess: () => {
        sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY);
        toast.success(emailOtpLocalization.emailVerified);
        navigate({ to: redirectTo });
      },
    });

  const isPending = isSending || isVerifying;

  const verifyCode = async (completedCode: string) => {
    if (isPending || !email) return;

    await verifyEmailOtp({ email, otp: completedCode });
  };

  const form = useAuthForm({
    defaultValues: { code: "", email: "" },
    onSubmit: async ({ value }) => {
      if (!email) {
        await sendVerificationOtp({
          email: value.email,
          type: "email-verification",
        });
        return;
      }
      await verifyCode(value.code);
    },
  });
  const codeComplete = useSelector(
    form.store,
    (state) => state.values.code.length === otpLength,
  );

  return (
    <AuthFormContainer className={className}>
      <div className="flex flex-col">
        <h1
          className={`text-xl font-semibold tracking-tight ${email ? "mb-1.5" : "mb-4"}`}
        >
          {localization.auth.verifyEmail}
        </h1>
        {email && (
          <p className="mb-4 text-sm text-muted-foreground">
            {emailOtpLocalization.codeSentTo.replace("{{email}}", email)}
          </p>
        )}

        <form.AppForm>
          <form.AuthFormRoot>
            <div className="flex flex-col gap-6">
              {email ? (
                <form.AppField name="code">
                  {(field) => (
                    <OtpField
                      autoFocus
                      disabled={isPending}
                      label={emailOtpLocalization.code}
                      length={otpLength}
                      name="otp"
                      value={field.state.value}
                      onChange={field.handleChange}
                      onComplete={() => void submitAuthForm(form)}
                    />
                  )}
                </form.AppField>
              ) : (
                <form.AppField
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      validateEmailAddress(value, {
                        invalidMessage: localization.auth.invalidEmail,
                        requiredMessage: localization.auth.fieldRequired,
                      }),
                  }}
                >
                  {(field) => {
                    const isInvalid = isAuthFormFieldInvalid(field.state.meta);

                    return (
                      <Field invalid={isInvalid}>
                        <FieldLabel htmlFor="email">
                          {localization.auth.email}
                        </FieldLabel>

                        <Input
                          id="email"
                          name={field.name}
                          type="email"
                          autoComplete="email"
                          placeholder={localization.auth.emailPlaceholder}
                          aria-required="true"
                          aria-invalid={isInvalid || undefined}
                          disabled={isPending}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                        />

                        <field.AuthFormFieldError />
                      </Field>
                    );
                  }}
                </form.AppField>
              )}

              <form.AuthFormServerError />

              <div className="flex flex-col gap-3">
                <form.AuthFormSubmitButton
                  isPending={isPending}
                  disabled={isPending || (Boolean(email) && !codeComplete)}
                >
                  {email
                    ? emailOtpLocalization.verifyCode
                    : emailOtpLocalization.sendCode}
                </form.AuthFormSubmitButton>

                {email && <OpenEmailButton email={email} variant="secondary" />}

                {email && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || isCoolingDown}
                    onClick={() =>
                      void runAuthFormAction(form, () =>
                        sendVerificationOtp({
                          email,
                          type: "email-verification",
                        }),
                      )
                    }
                  >
                    {isCoolingDown
                      ? localization.auth.resendIn.replace(
                          "{{seconds}}",
                          String(cooldown),
                        )
                      : localization.auth.resend}
                  </Button>
                )}
              </div>
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-center text-xs text-muted-foreground">
            {localization.auth.alreadyVerifiedYourEmail}{" "}
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
      </div>
    </AuthFormContainer>
  );
}
