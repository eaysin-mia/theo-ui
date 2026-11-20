"use client";

import { validateStringLength } from "@better-auth-ui/core";
import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useUpdatePasskey } from "@better-auth-ui/react/plugins/passkey";
import { useEffect } from "react";
import { Button } from "#components/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "#components/dialog";
import { Field, FieldLabel } from "#components/field";
import { Input } from "#components/input";
import { passkeyPlugin } from "#lib/auth/passkey-plugin";
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form";
import type { ListedPasskey } from "./delete-passkey-dialog";

export function RenamePasskeyDialog({
  open,
  onOpenChange,
  passkey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passkey: ListedPasskey;
}) {
  const { authClient, localization } = useAuth<PasskeyAuthClient>();
  const { localization: labels } = useAuthPlugin(passkeyPlugin);
  const updatePasskey = useUpdatePasskey(authClient, {
    onSuccess: () => onOpenChange(false),
  });
  const form = useAuthForm({
    defaultValues: { name: passkey.name ?? "" },
    onSubmit: async ({ value }) => {
      const name = value.name.trim();
      if (name) await updatePasskey.mutateAsync({ id: passkey.id, name });
    },
  });

  useEffect(() => {
    if (open) form.reset({ name: passkey.name ?? "" });
  }, [form, open, passkey.name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{labels.renamePasskey}</DialogTitle>
        </DialogHeader>
        <form.AppForm>
          <form.AuthFormRoot className="contents">
            <DialogPanel>
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
                {(field) => (
                  <Field invalid={isAuthFormFieldInvalid(field.state.meta)}>
                    <FieldLabel htmlFor={`passkey-name-${passkey.id}`}>
                      {labels.name}
                    </FieldLabel>
                    <Input
                      type="text"
                      id={`passkey-name-${passkey.id}`}
                      name={field.name}
                      autoFocus
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-required="true"
                      aria-invalid={
                        isAuthFormFieldInvalid(field.state.meta) || undefined
                      }
                    />
                    <field.AuthFormFieldError />
                  </Field>
                )}
              </form.AppField>
            </DialogPanel>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" type="button">
                    {localization.settings.cancel}
                  </Button>
                }
              />
              <form.AuthFormSubmitButton
                isPending={updatePasskey.isPending}
                disabled={updatePasskey.isPending}
              >
                {localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogPopup>
    </Dialog>
  );
}
