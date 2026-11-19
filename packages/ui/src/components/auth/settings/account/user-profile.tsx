"use client";

import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength,
} from "@better-auth-ui/core";
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username";
import { useAuth, useSession, useUpdateUser } from "@better-auth-ui/react";
import { useEffect, useMemo } from "react";
import { toastManager } from "theo-ui/components/toast";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "theo-ui/components/card";
import { Field, FieldLabel } from "theo-ui/components/field";
import { Input } from "theo-ui/components/input";
import { Skeleton } from "theo-ui/components/skeleton";
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm,
} from "../../auth-form";
import { ChangeAvatar } from "./change-avatar";

export type UserProfileProps = {
  className?: string;
};

/**
 * Render a profile card that lets the authenticated user view and update their display name, username, and avatar.
 *
 * @param className - Optional additional CSS class names applied to the card container
 * @returns A JSX element containing the profile card with avatar upload and editable name/username fields
 */
export function UserProfile({ className }: UserProfileProps) {
  const { additionalFields, authClient, avatar, localization, profile } =
    useAuth<UsernameAuthClient>();
  const { data: session } = useSession(authClient);

  const { mutateAsync: updateUser, isPending } = useUpdateUser(authClient, {
    onSuccess: () =>
      toastManager.add({
        type: "success",
        title: localization.settings.profileUpdatedSuccess,
      }),
  });

  const profileFields = useMemo(
    () => additionalFields?.filter((field) => field.profile !== false) ?? [],
    [additionalFields],
  );
  const hasProfileFields =
    profile.name || profileFields.some((field) => field.inputType !== "hidden");
  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(profileFields),
      name: "",
    },
    onSubmit: async ({ value }) => {
      await updateUser({
        ...(profile.name && { name: value.name }),
        ...getAdditionalFieldSubmitValues(
          profileFields,
          value.additionalFields,
        ),
      });
    },
  });

  useEffect(() => {
    if (!session) return;
    form.reset({
      additionalFields: getAdditionalFieldDefaultValues(
        fieldsWithModelValues(
          profileFields,
          session.user as Record<string, unknown>,
        ),
      ),
      name: session.user.name,
    });
  }, [form, profileFields, session]);

  if (!avatar.enabled && !hasProfileFields) return null;

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <Card className={className}>
          <CardHeader>
            <CardTitle>{localization.settings.userProfile}</CardTitle>
            <CardDescription>
              Manage your personal profile and display information.
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col gap-6">
            <ChangeAvatar />

            {profile.name && (
              <form.AppField
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    validateStringLength(value, {
                      requiredMessage: localization.auth.fieldRequired,
                      trim: true,
                    }),
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta);

                  return (
                    <Field invalid={isInvalid} className="w-full">
                      <FieldLabel htmlFor="name">
                        {localization.auth.name}
                      </FieldLabel>

                      {session ? (
                        <Input
                          id="name"
                          name={field.name}
                          autoComplete="name"
                          placeholder={localization.auth.name}
                          disabled={isPending}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
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
            )}

            {profileFields.map((configuredField) => {
              if (!session) {
                if (configuredField.inputType === "hidden") {
                  return null;
                }

                return (
                  <Field key={configuredField.name} className="w-full">
                    <FieldLabel>
                      {configuredField.label ?? configuredField.name}
                    </FieldLabel>
                    <Skeleton className="h-8 w-full rounded-md" />
                  </Field>
                );
              }

              return (
                <form.AppField
                  key={configuredField.name}
                  name={`additionalFields.${configuredField.name}`}
                  validators={getAuthAdditionalFieldValidators(
                    configuredField,
                    localization.auth.fieldRequired,
                  )}
                >
                  {(field) => (
                    <field.AuthFormAdditionalField
                      field={configuredField}
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              );
            })}
          </CardPanel>

          {hasProfileFields && (
            <CardFooter className="justify-end border-t bg-muted/40 p-4 sm:p-6">
              <form.AuthFormSubmitButton
                size="sm"
                disabled={isPending || !session}
              >
                {localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </CardFooter>
          )}
        </Card>
      </form.AuthFormRoot>
    </form.AppForm>
  );
}
