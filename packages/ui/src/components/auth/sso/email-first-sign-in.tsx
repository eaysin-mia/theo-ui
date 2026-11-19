"use client";

import {
  getAuthCallbackURL,
  getAuthErrorCode,
  getAuthLinkURL,
  authMutationKeys,
  validateEmailAddress,
  validateStringLength,
} from "@better-auth-ui/core";

import {
  isPasskeyAutoFillEnabled,
  withPasskeyAutoFill,
} from "@better-auth-ui/core/plugins/passkey";
import {
  type SsoAuthClient,
  setSsoFallbackEmail,
} from "@better-auth-ui/core/plugins/sso";
import {
  AuthPrompts,
  getAuthButtonKey,
  useAuth,
  useAuthPlugin,
  useFetchOptions,
  useSignInEmail,
} from "@better-auth-ui/react";
import { useSignInSso } from "@better-auth-ui/react/plugins/sso";
import { useSelector } from "@tanstack/react-form";
import { useIsMutating } from "@tanstack/react-query";
import { CircleAlertIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "theoui/components/button";
import { Checkbox } from "theoui/components/checkbox";
import { Alert, AlertDescription } from "theoui/components/alert";
import { Field, FieldLabel, FieldSeparator } from "theoui/components/field";
import { Input } from "theoui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "theoui/components/input-group";
import { ssoPlugin } from "theoui/lib/auth/sso-plugin";
import { useSignInContinuation } from "theoui/lib/auth/use-sign-in-continuation";
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form";
import { AuthFormContainer } from "../auth-layout";
import { ProviderButtons } from "../provider-buttons";
import { ReauthenticationNotice } from "../reauthentication";

export type EmailFirstSignInProps = {
  className?: string;
  socialLayout?: "auto" | "horizontal" | "vertical" | "grid";
  socialPosition?: "top" | "bottom";
};

/** Discover organization SSO by email, then expose configured fallback methods. */
export function EmailFirstSignIn({
  className,
  socialLayout,
  socialPosition = "bottom",
}: EmailFirstSignInProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    navigate,
    plugins,
    redirectTo,
    socialProviders,
    viewPaths,
    Link,
  } = useAuth();
  const { localization: ssoLocalization } = useAuthPlugin(ssoPlugin);
  const { fetchOptions, resetFetchOptions } = useFetchOptions();
  const continueSignIn = useSignInContinuation();

  const [step, setStep] = useState<"email" | "fallback">("email");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [discoveryError, setDiscoveryError] = useState("");

  const { mutateAsync: signInSso, isPending: isDiscovering } = useSignInSso(
    authClient as SsoAuthClient,
    {
      meta: { errorPresentation: "inline" },
      onError: (error) => {
        if (error.status === 404) {
          setSsoFallbackEmail(form.state.values.email);
          setDiscoveryError(ssoLocalization.noProvider);
          setStep("fallback");
          return;
        }
      },
    },
  );

  const { mutateAsync: signInEmail, isPending: isSigningIn } = useSignInEmail(
    authClient,
    {
      meta: { errorPresentation: "inline" },
      onError: () => resetFetchOptions(),
      onSuccess: (data) => continueSignIn(data),
    },
  );

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const isPending = signInMutating > 0;
  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent,
  )?.captchaComponent;

  const passkeyAutoFill = isPasskeyAutoFillEnabled(plugins);
  const showSocialSeparator =
    emailAndPassword.enabled && !!socialProviders?.length;

  const form = useAuthForm({
    defaultValues: { email: "", password: "", rememberMe: false },
    onSubmit: async ({ value }) => {
      if (step === "email") {
        setDiscoveryError("");
        setSsoFallbackEmail(value.email);
        try {
          await signInSso({
            callbackURL: getAuthCallbackURL(baseURL, redirectTo),
            email: value.email,
            loginHint: value.email,
          });
        } catch (error) {
          if ((error as { status?: number }).status !== 404) throw error;
        }
        return;
      }
      try {
        await signInEmail({
          email: value.email,
          password: value.password,
          ...(emailAndPassword.rememberMe
            ? { rememberMe: value.rememberMe }
            : {}),
          fetchOptions,
        });
      } catch (error) {
        if (getAuthErrorCode(error) !== "EMAIL_NOT_VERIFIED") throw error;
        sessionStorage.setItem("better-auth-ui.verify-email", value.email);
        navigate({
          to: getAuthLinkURL(
            `${basePaths.auth}/${viewPaths.auth.verifyEmail}`,
            redirectTo,
          ),
        });
      }
    },
  });
  const email = useSelector(form.store, (state) => state.values.email);

  const startOver = () => {
    setStep("email");
    form.setFieldValue("password", "");
    setDiscoveryError("");
  };

  return (
    <AuthFormContainer className={className}>
      <div className="flex flex-col">
        <AuthPrompts view="signIn" />
        <ReauthenticationNotice />
        <h1 className="text-xl font-semibold tracking-tight">
          {localization.auth.signIn}
        </h1>
        <p className="mt-1.5 mb-4 text-sm text-muted-foreground">
          {step === "email" ? ssoLocalization.emailFirstDescription : email}
        </p>

        <form.AppForm>
          {step === "email" ? (
            <form.AuthFormRoot
              serverErrorMessage={ssoLocalization.ssoUnavailable}
            >
              <div className="flex flex-col gap-4">
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
                        <FieldLabel htmlFor="sso-email">
                          {localization.auth.email}
                        </FieldLabel>
                        <Input
                          id="sso-email"
                          name={field.name}
                          type="email"
                          autoComplete={withPasskeyAutoFill(
                            "email",
                            passkeyAutoFill,
                          )}
                          autoFocus
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={localization.auth.emailPlaceholder}
                          required
                          disabled={isPending}
                          aria-invalid={isInvalid || undefined}
                        />
                        <field.AuthFormFieldError />
                      </Field>
                    );
                  }}
                </form.AppField>

                {discoveryError && (
                  <Alert variant="error">
                    <CircleAlertIcon aria-hidden="true" />
                    <AlertDescription>{discoveryError}</AlertDescription>
                  </Alert>
                )}

                <form.AuthFormServerError />

                <form.AuthFormSubmitButton
                  isPending={isDiscovering}
                  disabled={isPending}
                >
                  {ssoLocalization.continueWithEmail}
                </form.AuthFormSubmitButton>
              </div>
            </form.AuthFormRoot>
          ) : (
            <div className="flex flex-col gap-4">
              {socialPosition === "top" && (
                <>
                  {!!socialProviders?.length && (
                    <ProviderButtons
                      socialLayout={socialLayout}
                      view="signIn"
                    />
                  )}
                  {showSocialSeparator && (
                    <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                      {localization.auth.or}
                    </FieldSeparator>
                  )}
                </>
              )}

              {discoveryError && (
                <Alert variant="info">
                  <AlertDescription>{discoveryError}</AlertDescription>
                </Alert>
              )}

              {emailAndPassword.enabled && (
                <form.AuthFormRoot
                  serverErrorMessage={localization.errors.generic}
                >
                  <div className="flex flex-col gap-4">
                    <form.AppField
                      name="password"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
                            maxLength: emailAndPassword.maxPasswordLength,
                            maxLengthMessage: localization.auth.tooLong.replace(
                              "{{max}}",
                              String(emailAndPassword.maxPasswordLength),
                            ),
                            minLength: emailAndPassword.minPasswordLength,
                            minLengthMessage:
                              localization.auth.tooShort.replace(
                                "{{min}}",
                                String(emailAndPassword.minPasswordLength),
                              ),
                            requiredMessage: localization.auth.fieldRequired,
                          }),
                      }}
                    >
                      {(field) => {
                        const isInvalid = isAuthFormFieldInvalid(
                          field.state.meta,
                        );
                        return (
                          <Field invalid={isInvalid}>
                            <FieldLabel htmlFor="sso-password">
                              {localization.auth.password}
                            </FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                id="sso-password"
                                name={field.name}
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete={withPasskeyAutoFill(
                                  "current-password",
                                  passkeyAutoFill,
                                )}
                                autoFocus
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                placeholder={
                                  localization.auth.passwordPlaceholder
                                }
                                minLength={emailAndPassword.minPasswordLength}
                                maxLength={emailAndPassword.maxPasswordLength}
                                required
                                disabled={isPending}
                                aria-invalid={isInvalid || undefined}
                              />
                              <InputGroupAddon align="inline-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label={
                                    isPasswordVisible
                                      ? localization.auth.hidePassword
                                      : localization.auth.showPassword
                                  }
                                  onClick={() =>
                                    setIsPasswordVisible((visible) => !visible)
                                  }
                                >
                                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                                </Button>
                              </InputGroupAddon>
                            </InputGroup>
                            <field.AuthFormFieldError />
                          </Field>
                        );
                      }}
                    </form.AppField>

                    {emailAndPassword.rememberMe && (
                      <form.AppField name="rememberMe">
                        {(field) => (
                          <Field>
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id="sso-remember-me"
                                name={field.name}
                                checked={field.state.value}
                                disabled={isPending}
                                onCheckedChange={(checked) =>
                                  field.handleChange(checked === true)
                                }
                              />
                              <FieldLabel
                                htmlFor="sso-remember-me"
                                className="cursor-pointer text-sm font-normal"
                              >
                                {localization.auth.rememberMe}
                              </FieldLabel>
                            </div>
                          </Field>
                        )}
                      </form.AppField>
                    )}

                    {Captcha && (
                      <div className="flex justify-center">{Captcha}</div>
                    )}

                    <form.AuthFormServerError />

                    <form.AuthFormSubmitButton
                      isPending={isSigningIn}
                      disabled={isPending}
                    >
                      {localization.auth.signIn}
                    </form.AuthFormSubmitButton>
                  </div>
                </form.AuthFormRoot>
              )}

              {plugins.flatMap((plugin) =>
                (plugin.authButtons ?? []).map((AuthButton) => (
                  <AuthButton
                    key={getAuthButtonKey(plugin.id, AuthButton)}
                    view="signIn"
                  />
                )),
              )}

              {socialPosition === "bottom" && (
                <>
                  {showSocialSeparator && (
                    <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                      {localization.auth.or}
                    </FieldSeparator>
                  )}
                  {!!socialProviders?.length && (
                    <ProviderButtons
                      socialLayout={socialLayout}
                      view="signIn"
                    />
                  )}
                </>
              )}

              <Button variant="ghost" onClick={startOver}>
                {ssoLocalization.useDifferentEmail}
              </Button>
            </div>
          )}
        </form.AppForm>

        {emailAndPassword.enabled && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {step === "fallback" && emailAndPassword.forgotPassword && (
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                className="text-sm underline-offset-4 hover:underline"
              >
                {localization.auth.forgotPasswordLink}
              </Link>
            )}
            <p className="text-center text-sm text-muted-foreground">
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
