"use client";

import { getAuthLinkURL, validateEmailAddress } from "@better-auth-ui/core";
import type { EmailOtpAuthClient } from "@better-auth-ui/core/plugins/email-otp";
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react";
import { useRequestPasswordResetOtp } from "@better-auth-ui/react/plugins/email-otp";
import { useId } from "react";

import { Field, FieldLabel } from "#components/field";
import { Input } from "#components/input";
import { emailOtpPlugin } from "#lib/auth/email-otp-plugin";
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form";
import { AuthFormContainer } from "../auth-layout";

/** `sessionStorage` key the reset-code form reads the pending address from. */
export const RESET_PASSWORD_OTP_STORAGE_KEY =
  "better-auth-ui.reset-password-otp";

export type ForgotPasswordOtpProps = {
  className?: string;
};

/**
 * Request a password-reset code instead of a reset link.
 *
 * Replaces the built-in `<ForgotPassword />` view when the email-OTP plugin
 * runs with `passwordReset: true`. On success the address is stored and the
 * user continues on `/auth/reset-password`, which asks for the code and the
 * new password — the reset-link-sent view is skipped entirely.
 *
 * @param className - Additional CSS classes applied to the form container.
 */
export function ForgotPasswordOtp({ className }: ForgotPasswordOtpProps) {
  const emailErrorId = useId();
  const {
    authClient,
    basePaths,
    localization,
    navigate,
    plugins,
    redirectTo,
    viewPaths,
    Link,
  } = useAuth();
  const { localization: emailOtpLocalization } = useAuthPlugin(emailOtpPlugin);

  const { fetchOptions, resetFetchOptions } = useFetchOptions();

  const { mutateAsync: requestPasswordResetOtp, isPending } =
    useRequestPasswordResetOtp(authClient as EmailOtpAuthClient, {
      meta: { errorPresentation: "inline" },
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { email }) => {
        sessionStorage.setItem(RESET_PASSWORD_OTP_STORAGE_KEY, email);
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.resetPassword}` });
      },
    });

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) =>
      await requestPasswordResetOtp({ email: value.email, fetchOptions }),
  });

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent,
  )?.captchaComponent;

  return (
    <AuthFormContainer className={className}>
      <div className="flex flex-col">
        <h1 className="mb-4 text-xl font-semibold tracking-tight">
          {localization.auth.forgotPassword}
        </h1>

        <form.AppForm>
          <form.AuthFormRoot
            noValidate
            serverErrorMessage={localization.errors.generic}
          >
            <div className="flex flex-col gap-6">
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
                        aria-describedby={isInvalid ? emailErrorId : undefined}
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        placeholder={localization.auth.emailPlaceholder}
                        required
                        disabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid || undefined}
                      />
                      <field.AuthFormFieldError id={emailErrorId} />
                    </Field>
                  );
                }}
              </form.AppField>

              {Captcha && <div className="flex justify-center">{Captcha}</div>}

              <form.AuthFormServerError />

              <form.AuthFormSubmitButton
                isPending={isPending}
                disabled={isPending}
              >
                {emailOtpLocalization.sendCode}
              </form.AuthFormSubmitButton>
            </div>
          </form.AuthFormRoot>
        </form.AppForm>

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
      </div>
    </AuthFormContainer>
  );
}
