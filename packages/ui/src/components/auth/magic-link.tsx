"use client";

import {
  getAuthCallbackURL,
  authMutationKeys,
  validateEmailAddress,
} from "@better-auth-ui/core";

import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link";
import { getSsoFallbackEmail } from "@better-auth-ui/core/plugins/sso";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useSignInMagicLink } from "@better-auth-ui/react/plugins/magic-link";
import { useIsMutating } from "@tanstack/react-query";
import { useId } from "react";

import {
  Field,
  FieldLabel,
  FieldSeparator,
} from "@theo/ui/field";
import { Input } from "@theo/ui/input";
import { magicLinkPlugin } from "@theo/ui/auth/plugins/magic-link-plugin";
import { isAuthFormFieldInvalid, useAuthForm } from "@theo/ui/auth/auth-form";
import { AuthFormContainer } from "@theo/ui/auth/auth-layout";
import { MAGIC_LINK_SENT_STORAGE_KEY } from "@theo/ui/auth/magic-link-sent";
import { ProviderButtons, type SocialLayout } from "@theo/ui/auth/provider-buttons";
import { ReauthenticationNotice } from "@theo/ui/auth/reauthentication";

export type MagicLinkProps = {
  className?: string;
  socialLayout?: SocialLayout;
  socialPosition?: "top" | "bottom";
};

/**
 * Render a sign-in form that sends an email magic link and optionally shows social provider buttons.
 *
 * @param className - Additional CSS class names applied to the form container
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The magic-link sign-in UI as a JSX element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
}: MagicLinkProps) {
  const emailErrorId = useId();
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
  } = useAuth<MagicLinkAuthClient>();
  const { localization: magicLinkLocalization, viewPaths: magicLinkViewPaths } =
    useAuthPlugin(magicLinkPlugin);

  const { mutateAsync: signInMagicLink, isPending: signInMagicLinkPending } =
    useSignInMagicLink(authClient, {
      meta: { errorPresentation: "inline" },
      onSuccess: (_data, variables) => {
        sessionStorage.setItem(MAGIC_LINK_SENT_STORAGE_KEY, variables.email);
        navigate({
          to: `${basePaths.auth}/${magicLinkViewPaths.auth.magicLinkSent}`,
        });
      },
    });

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all,
  });
  const isPending = signInMutating + signUpMutating > 0;

  const form = useAuthForm({
    defaultValues: { email: getSsoFallbackEmail() },
    onSubmit: async ({ value }) =>
      await signInMagicLink({
        callbackURL: getAuthCallbackURL(baseURL, redirectTo),
        email: value.email,
      }),
  });

  const showSeparator = socialProviders && socialProviders.length > 0;

  return (
    <AuthFormContainer className={className}>
      <div className="flex flex-col">
        <ReauthenticationNotice />
        <h1 className="mb-4 text-xl font-semibold tracking-tight">
          {localization.auth.signIn}
        </h1>

        <div className="flex flex-col gap-6">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view="magicLink" />
              )}

              {showSeparator && (
                <FieldSeparator className="m-0 flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

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
                          aria-describedby={
                            isInvalid ? emailErrorId : undefined
                          }
                          name={field.name}
                          type="email"
                          autoComplete="email"
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
                        <field.AuthFormFieldError id={emailErrorId} />
                      </Field>
                    );
                  }}
                </form.AppField>

                <div className="flex flex-col gap-3">
                  <form.AuthFormSubmitButton
                    isPending={signInMagicLinkPending}
                    disabled={isPending}
                  >
                    {magicLinkLocalization.sendMagicLink}
                  </form.AuthFormSubmitButton>

                  {plugins.flatMap((plugin) =>
                    (plugin.authButtons ?? []).map((AuthButton, index) => (
                      <AuthButton
                        key={`${plugin.id}-${index.toString()}`}
                        view="magicLink"
                      />
                    )),
                  )}
                </div>
                <form.AuthFormServerError />
              </div>
            </form.AuthFormRoot>
          </form.AppForm>

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-background">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons socialLayout={socialLayout} view="magicLink" />
              )}
            </>
          )}
        </div>
      </div>

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
    </AuthFormContainer>
  );
}
