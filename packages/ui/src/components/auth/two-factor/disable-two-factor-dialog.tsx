"use client";

import type { TwoFactorAuthClient } from "@better-auth-ui/core/plugins/two-factor";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useDisableTwoFactor } from "@better-auth-ui/react/plugins/two-factor";
import { ShieldAlert } from "lucide-react";
import { toastManager } from "@workspace/ui/components/toast";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { twoFactorPlugin } from "@workspace/ui/lib/auth/two-factor-plugin";
import { useTwoFactorPasswordRequirement } from "@workspace/ui/lib/auth/use-two-factor-password";
import { useAuthForm } from "../auth-form";

export type DisableTwoFactorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Confirm turning two-factor off.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function DisableTwoFactorDialog({
  open,
  onOpenChange,
}: DisableTwoFactorDialogProps) {
  const { authClient, localization } = useAuth();
  const { localization: twoFactorLocalization } =
    useAuthPlugin(twoFactorPlugin);
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement();

  const { mutateAsync: disableTwoFactor, isPending: isDisabling } =
    useDisableTwoFactor(authClient as TwoFactorAuthClient, {
      onSuccess: () => {
        toastManager.add({
          type: "success",
          title: twoFactorLocalization.twoFactorDisabled,
        });
        onOpenChange(false);
      },
    });

  const isPending = isDisabling || isResolvingPasswordRequirement;

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) =>
      await disableTwoFactor(
        requiresPassword ? { password: value.password } : {},
      ),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {twoFactorLocalization.disableTwoFactor}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {requiresPassword
              ? twoFactorLocalization.passwordConfirmation
              : twoFactorLocalization.twoFactorDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form.AppForm>
          <form.AuthFormRoot className="contents">
            {requiresPassword && (
              <div className="px-6 pb-6">
                <form.AppField name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="disable-two-factor-password">
                        {localization.auth.password}
                      </FieldLabel>

                      <Input
                        id="disable-two-factor-password"
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        placeholder={localization.auth.passwordPlaceholder}
                        disabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />

                      <field.AuthFormFieldError />
                    </Field>
                  )}
                </form.AppField>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogClose
                disabled={isPending}
                render={
                  <Button type="button" variant="ghost">
                    {localization.settings.cancel}
                  </Button>
                }
              />

              <form.AuthFormSubmitButton
                isPending={isPending}
                variant="destructive"
                disabled={isPending}
              >
                {twoFactorLocalization.disableTwoFactor}
              </form.AuthFormSubmitButton>
            </AlertDialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
