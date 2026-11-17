"use client";

import {
  emailOtpPlugin,
  type EmailOtpAuthClient,
} from "@better-auth-ui/core/plugins/email-otp";
import { useRequestPasswordResetOtp } from "@better-auth-ui/react/plugins/email-otp";

import {
  getAuthLinkURL,
  getViewURL,
  isPasswordCompromisedError,
  validateMatchingValue,
  validateStringLength,
} from "@better-auth-ui/core";
import {
  useAuth,
  useChangePassword,
  useFetchOptions,
  useListAccounts,
  useRequestPasswordReset,
  useSession,
} from "@better-auth-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toastManager } from "@theo/ui/toast";
import { Button } from "@theo/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/card";
import { Field, FieldError, FieldLabel } from "@theo/ui/field";
import { Input } from "@theo/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@theo/ui/input-group";
import { Skeleton } from "@theo/ui/skeleton";
import { Spinner } from "@theo/ui/spinner";
import { cn } from "@theo/ui/utils";
import { isAuthFormFieldInvalid, useAuthForm } from "@theo/ui/auth/auth-form";
import { OpenEmailButton } from "@theo/ui/auth/open-email-button";
import { PasswordStrengthMeter } from "@theo/ui/auth/password-strength-meter";

export type ChangePasswordProps = {
  className?: string;
};

/**
 * Render a card form for changing the authenticated user's password.
 *
 * When the user has a credential account, displays fields for current password,
 * new password, and optionally confirm password. When the user only has social
 * accounts, displays a prompt to set a password via the reset flow.
 *
 * @returns A JSX element containing the change-password or set-password card
 */
export function ChangePassword({ className }: ChangePasswordProps) {
  const { authClient, emailAndPassword, localization } = useAuth();
  const { data: session } = useSession(authClient);
  const { data: accounts, isPending: isAccountsPending } =
    useListAccounts(authClient);

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential",
  );

  if (!isAccountsPending && !hasCredentialAccount) {
    return <SetPassword className={className} />;
  }

  return (
    <ChangePasswordForm
      className={className}
      emailAndPassword={emailAndPassword}
      localization={localization}
      session={isAccountsPending ? undefined : session}
    />
  );
}

function SetPassword({ className }: { className?: string }) {
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    navigate,
    plugins,
    redirectTo,
    viewPaths,
  } = useAuth<EmailOtpAuthClient>();
  const emailOtp = plugins.find(
    (plugin): plugin is ReturnType<typeof emailOtpPlugin> =>
      plugin.id === emailOtpPlugin.id,
  );
  const useOtp = Boolean(emailOtp?.passwordReset);
  const { data: session } = useSession(authClient);
  const { fetchOptions, resetFetchOptions } = useFetchOptions();
  const [sentEmail, setSentEmail] = useState("");

  const { mutate: requestPasswordReset, isPending: isLinkPending } =
    useRequestPasswordReset(authClient, {
      onError: () => {
        resetFetchOptions();
      },
      onSuccess: (_data, { email }) => {
        setSentEmail(email);
      },
    });

  const { mutate: requestPasswordResetOtp, isPending: isOtpPending } =
    useRequestPasswordResetOtp(authClient, {
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { email }) => {
        sessionStorage.setItem("better-auth-ui.reset-password-otp", email);
        navigate({
          to: getAuthLinkURL(
            getViewURL("", basePaths.auth, viewPaths.auth.resetPassword),
            redirectTo,
          ),
        });
      },
    });
  const isPending = isLinkPending || isOtpPending;

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent,
  )?.captchaComponent;

  const handleSetPassword = () => {
    if (!session) return;

    if (useOtp) {
      requestPasswordResetOtp({ email: session.user.email, fetchOptions });
      return;
    }
    requestPasswordReset({
      email: session.user.email,
      redirectTo: getViewURL(
        baseURL,
        basePaths.auth,
        viewPaths.auth.resetPassword,
      ),
      fetchOptions,
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{localization.settings.changePassword}</CardTitle>
        <CardDescription>
          {localization.settings.setPasswordDescription}
        </CardDescription>
      </CardHeader>

      <CardPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm leading-tight font-medium">
            {localization.settings.setPassword}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {localization.settings.setPasswordDescription}
          </p>
        </div>

        {sentEmail ? (
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="text-sm" role="status">
              {localization.auth.resetLinkSentTo.replace(
                "{{email}}",
                sentEmail,
              )}
            </p>

            <OpenEmailButton email={sentEmail} className="w-auto" />
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {Captcha && <div>{Captcha}</div>}

            <Button
              size="sm"
              disabled={isPending || !session?.user.email}
              onClick={handleSetPassword}
            >
              {isPending && <Spinner />}

              {useOtp
                ? emailOtp?.localization.sendCode
                : localization.auth.sendResetLink}
            </Button>
          </div>
        )}
      </CardPanel>
    </Card>
  );
}

function ChangePasswordForm({
  className,
  emailAndPassword,
  localization,
  session,
}: {
  className?: string;
  emailAndPassword: ReturnType<typeof useAuth>["emailAndPassword"];
  localization: ReturnType<typeof useAuth>["localization"];
  session: ReturnType<typeof useSession>["data"];
}) {
  const { authClient } = useAuth<EmailOtpAuthClient>();
  const { mutateAsync: changePassword, isPending } = useChangePassword(
    authClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        setIsCompromised(isPasswordCompromisedError(error));
      },
      onSuccess: () => {
        form.reset();
        toastManager.add({
          type: "success",
          title: localization.settings.changePasswordSuccess,
        });
      },
    },
  );

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [isCompromised, setIsCompromised] = useState(false);

  const form = useAuthForm({
    defaultValues: {
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        });
      } catch {
        // The mutation reports the error through its configured handler.
      }
    },
  });

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <Card className={cn("w-full", className)}>
          <CardHeader>
            <CardTitle>{localization.settings.changePassword}</CardTitle>
            <CardDescription>
              Ensure your account is using a long, random password to stay
              secure.
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col gap-6">
            <form.AppField
              name="currentPassword"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: localization.auth.fieldRequired,
                  }),
              }}
            >
              {(field) => {
                const isInvalid = isAuthFormFieldInvalid(field.state.meta);
                return (
                  <Field invalid={isInvalid}>
                    <FieldLabel htmlFor="currentPassword">
                      {localization.settings.currentPassword}
                    </FieldLabel>

                    {session ? (
                      <InputGroup>
                        <InputGroupInput
                          id="currentPassword"
                          name={field.name}
                          type={isCurrentPasswordVisible ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder={
                            localization.settings.currentPasswordPlaceholder
                          }
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isPending}
                          required
                          aria-invalid={isInvalid || undefined}
                        />

                        <InputGroupAddon align="inline-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={
                              isCurrentPasswordVisible
                                ? localization.auth.hidePassword
                                : localization.auth.showPassword
                            }
                            title={
                              isCurrentPasswordVisible
                                ? localization.auth.hidePassword
                                : localization.auth.showPassword
                            }
                            onClick={() => {
                              setIsCurrentPasswordVisible(
                                (visible) => !visible,
                              );
                            }}
                          >
                            {isCurrentPasswordVisible ? <EyeOff /> : <Eye />}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    ) : (
                      <Skeleton className="h-8 w-full rounded-md" />
                    )}

                    <field.AuthFormFieldError />
                  </Field>
                );
              }}
            </form.AppField>

            <form.AppField
              name="newPassword"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    maxLength: emailAndPassword.maxPasswordLength,
                    maxLengthMessage: localization.auth.tooLong.replace(
                      "{{max}}",
                      String(emailAndPassword.maxPasswordLength),
                    ),
                    minLength: emailAndPassword.minPasswordLength,
                    minLengthMessage: localization.auth.tooShort.replace(
                      "{{min}}",
                      String(emailAndPassword.minPasswordLength),
                    ),
                    requiredMessage: localization.auth.fieldRequired,
                  }),
              }}
            >
              {(field) => {
                const isInvalid =
                  isAuthFormFieldInvalid(field.state.meta) || isCompromised;

                return (
                  <Field invalid={isInvalid}>
                    <FieldLabel htmlFor="newPassword">
                      {localization.auth.newPassword}
                    </FieldLabel>

                    {session ? (
                      <InputGroup>
                        <InputGroupInput
                          id="newPassword"
                          name={field.name}
                          type={isNewPasswordVisible ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={localization.auth.newPasswordPlaceholder}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setIsCompromised(false);
                          }}
                          minLength={emailAndPassword.minPasswordLength}
                          maxLength={emailAndPassword.maxPasswordLength}
                          disabled={isPending}
                          required
                          aria-invalid={isInvalid || undefined}
                        />

                        <InputGroupAddon align="inline-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={
                              isNewPasswordVisible
                                ? localization.auth.hidePassword
                                : localization.auth.showPassword
                            }
                            onClick={() =>
                              setIsNewPasswordVisible((visible) => !visible)
                            }
                          >
                            {isNewPasswordVisible ? <EyeOff /> : <Eye />}
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    ) : (
                      <Skeleton className="h-8 w-full rounded-md" />
                    )}

                    {isCompromised ? (
                      <FieldError match={true}>
                        {localization.auth.passwordCompromised}
                      </FieldError>
                    ) : (
                      <field.AuthFormFieldError />
                    )}

                    <PasswordStrengthMeter password={field.state.value} />
                  </Field>
                );
              }}
            </form.AppField>

            {emailAndPassword.confirmPassword && (
              <form.AppField
                name="confirmPassword"
                validators={{
                  onChangeListenTo: ["newPassword"],
                  onChange: ({ fieldApi, value }) =>
                    validateStringLength(value, {
                      maxLength: emailAndPassword.maxPasswordLength,
                      maxLengthMessage: localization.auth.tooLong.replace(
                        "{{max}}",
                        String(emailAndPassword.maxPasswordLength),
                      ),
                      minLength: emailAndPassword.minPasswordLength,
                      minLengthMessage: localization.auth.tooShort.replace(
                        "{{min}}",
                        String(emailAndPassword.minPasswordLength),
                      ),
                      requiredMessage: localization.auth.fieldRequired,
                    }) ??
                    validateMatchingValue(
                      value,
                      fieldApi.form.getFieldValue("newPassword"),
                      localization.auth.passwordsDoNotMatch,
                    ),
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta);
                  return (
                    <Field invalid={isInvalid}>
                      <FieldLabel htmlFor="confirmPassword">
                        {localization.auth.confirmPassword}
                      </FieldLabel>

                      {session ? (
                        <InputGroup>
                          <InputGroupInput
                            id="confirmPassword"
                            name={field.name}
                            type={
                              isConfirmPasswordVisible ? "text" : "password"
                            }
                            autoComplete="new-password"
                            placeholder={
                              localization.auth.confirmPasswordPlaceholder
                            }
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            minLength={emailAndPassword.minPasswordLength}
                            maxLength={emailAndPassword.maxPasswordLength}
                            disabled={isPending}
                            required
                            aria-invalid={isInvalid || undefined}
                          />

                          <InputGroupAddon align="inline-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              aria-label={
                                isConfirmPasswordVisible
                                  ? localization.auth.hidePassword
                                  : localization.auth.showPassword
                              }
                              onClick={() =>
                                setIsConfirmPasswordVisible(
                                  (visible) => !visible,
                                )
                              }
                            >
                              {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                            </Button>
                          </InputGroupAddon>
                        </InputGroup>
                      ) : (
                        <Skeleton className="h-8 w-full rounded-md" />
                      )}

                      <field.AuthFormFieldError />
                    </Field>
                  );
                }}
              </form.AppField>
            )}
          </CardPanel>

          <CardFooter className="justify-end border-t bg-muted/40">
            <form.AuthFormSubmitButton
              disabled={isPending || !session}
              size="sm"
            >
              {localization.settings.updatePassword}
            </form.AuthFormSubmitButton>
          </CardFooter>
        </Card>
      </form.AuthFormRoot>
    </form.AppForm>
  );
}
