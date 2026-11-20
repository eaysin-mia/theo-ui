"use client";

import { getViewURL, validateEmailAddress } from "@better-auth-ui/core";
import { useAuth, useChangeEmail, useSession } from "@better-auth-ui/react";
import { useEffect } from "react";
import { toastManager } from "theoui/components/toast";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "theoui/components/card";
import { Field, FieldLabel } from "theoui/components/field";
import { Input } from "theoui/components/input";
import { Skeleton } from "theoui/components/skeleton";
import { isAuthFormFieldInvalid, useAuthForm } from "../../auth-form";

export type ChangeEmailProps = {
  className?: string;
};

/**
 * Render a card containing a form to view and update the authenticated user's email.
 *
 * Shows a loading skeleton until session data is available, displays the current
 * email as the form's default value, and sends a verification email to the
 * new address upon successful submission.
 *
 * @returns A JSX element rendering the change-email card and form
 */
export function ChangeEmail({ className }: ChangeEmailProps) {
  const { authClient, basePaths, baseURL, localization, viewPaths } = useAuth();
  const { data: session } = useSession(authClient);

  const { mutateAsync: changeEmail, isPending } = useChangeEmail(authClient, {
    onSuccess: () =>
      toastManager.add({
        type: "success",
        title: localization.settings.changeEmailSuccess,
      }),
  });

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) =>
      await changeEmail({
        callbackURL: getViewURL(
          baseURL,
          basePaths.settings,
          viewPaths.settings.account,
        ),
        newEmail: value.email,
      }),
  });

  useEffect(() => {
    if (session) form.reset({ email: session.user.email });
  }, [form, session]);

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <Card className={className}>
          <CardHeader>
            <CardTitle>{localization.settings.changeEmail}</CardTitle>
            <CardDescription>
              Update the email address associated with your account.
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col gap-6">
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
                  <Field invalid={isInvalid} className="w-full">
                    <FieldLabel htmlFor="email">
                      {localization.auth.email}
                    </FieldLabel>
                    {session ? (
                      <Input
                        id="email"
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder={localization.auth.emailPlaceholder}
                        disabled={isPending}
                        required
                        aria-invalid={isInvalid || undefined}
                      />
                    ) : (
                      <Skeleton className="h-8 w-full rounded-md" />
                    )}
                    <field.AuthFormFieldError />
                  </Field>
                );
              }}
            </form.AppField>
          </CardPanel>

          <CardFooter className="justify-end border-t bg-muted/40">
            <form.AuthFormSubmitButton
              isPending={isPending}
              size="sm"
              disabled={isPending || !session}
            >
              {localization.settings.updateEmail}
            </form.AuthFormSubmitButton>
          </CardFooter>
        </Card>
      </form.AuthFormRoot>
    </form.AppForm>
  );
}
