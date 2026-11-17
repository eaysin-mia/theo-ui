"use client";

import { isReauthenticationRequiredError } from "@better-auth-ui/core";
import type {
  AddPasskeyParams,
  PasskeyAuthClient,
} from "@better-auth-ui/core/plugins/passkey";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useAddPasskey } from "@better-auth-ui/react/plugins/passkey";
import { Fingerprint } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { passkeyPlugin } from "@workspace/ui/lib/auth/passkey-plugin";
import { useAuthForm } from "../auth-form";
import { ReauthenticationAction } from "../reauthentication";

export type AddPasskeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddPasskeyDialog({
  open,
  onOpenChange,
}: AddPasskeyDialogProps) {
  const { authClient, localization } = useAuth<PasskeyAuthClient>();
  const { authenticatorAttachment, localization: passkeyLocalization } =
    useAuthPlugin(passkeyPlugin);

  const addPasskey = useAddPasskey(authClient);

  const submitRequest = async (
    request: AddPasskeyParams<PasskeyAuthClient>,
  ) => {
    const requestWithCallbacks = {
      ...request,
      fetchOptions: {
        ...request?.fetchOptions,
        onSuccess: () => handleOpenChange(false),
      },
    };
    await addPasskey.mutateAsync(requestWithCallbacks);
  };

  const form = useAuthForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      const name = value.name.trim();
      await submitRequest({
        ...(name ? { name } : {}),
        ...(authenticatorAttachment ? { authenticatorAttachment } : {}),
      } as AddPasskeyParams<PasskeyAuthClient>);
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      addPasskey.reset();
      form.reset();
    }
    onOpenChange(nextOpen);
  };

  const needsReauthentication = isReauthenticationRequiredError(
    addPasskey.error,
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup>
        {needsReauthentication ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">
                {localization.settings.reauthenticationTitle}
              </DialogTitle>
            </DialogHeader>
            <ReauthenticationAction showTitle={false} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fingerprint />
                {passkeyLocalization.addPasskey}
              </DialogTitle>

              <DialogDescription>
                {passkeyLocalization.passkeysDescription}
              </DialogDescription>
            </DialogHeader>

            <form.AppForm>
              <form.AuthFormRoot className="contents">
                <DialogPanel>
                  <form.AppField name="name">
                    {(field) => (
                      <Field invalid={addPasskey.isError}>
                        <FieldLabel htmlFor="passkey-name">
                          {passkeyLocalization.name}
                        </FieldLabel>
                        <Input
                          type="text"
                          id="passkey-name"
                          name={field.name}
                          autoFocus
                          placeholder={localization.settings.optional}
                          disabled={addPasskey.isPending}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={addPasskey.isError || undefined}
                        />
                        {addPasskey.error && (
                          <FieldError match={true}>
                            {addPasskey.error.error?.message ??
                              addPasskey.error.message}
                          </FieldError>
                        )}
                      </Field>
                    )}
                  </form.AppField>
                </DialogPanel>

                <DialogFooter>
                  <DialogClose
                    disabled={addPasskey.isPending}
                    render={
                      <Button variant="outline" type="button">
                        {localization.settings.cancel}
                      </Button>
                    }
                  />

                  <form.AuthFormSubmitButton
                    isPending={addPasskey.isPending}
                    disabled={addPasskey.isPending}
                  >
                    {passkeyLocalization.addPasskey}
                  </form.AuthFormSubmitButton>
                </DialogFooter>
              </form.AuthFormRoot>
            </form.AppForm>
          </>
        )}
      </DialogPopup>
    </Dialog>
  );
}
