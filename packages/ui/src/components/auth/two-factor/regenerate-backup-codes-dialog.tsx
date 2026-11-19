"use client";

import type { TwoFactorAuthClient } from "@better-auth-ui/core/plugins/two-factor";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useGenerateBackupCodes } from "@better-auth-ui/react/plugins/two-factor";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toastManager } from "@theo/ui/components/toast";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@theo/ui/components/alert-dialog";
import { Button } from "@theo/ui/components/button";
import { Field, FieldLabel } from "@theo/ui/components/field";
import { Input } from "@theo/ui/components/input";
import { twoFactorPlugin } from "@theo/ui/lib/auth/two-factor-plugin";
import { useTwoFactorPasswordRequirement } from "@theo/ui/lib/auth/use-two-factor-password";
import { useAuthForm } from "../auth-form";
import { BackupCodes } from "./backup-codes";

export type RegenerateBackupCodesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Replace the existing backup codes with a fresh set.
 *
 * The new codes are shown once, in component state only — closing the dialog
 * is the point of no return, which is why the copy button sits right there.
 *
 * @param open - Whether the dialog is open.
 * @param onOpenChange - Called when the dialog requests an open state change.
 */
export function RegenerateBackupCodesDialog({
  open,
  onOpenChange,
}: RegenerateBackupCodesDialogProps) {
  const { authClient, localization } = useAuth();
  const { localization: twoFactorLocalization } =
    useAuthPlugin(twoFactorPlugin);
  const { isPending: isResolvingPasswordRequirement, requiresPassword } =
    useTwoFactorPasswordRequirement();

  const [codes, setCodes] = useState<string[]>([]);

  const {
    mutateAsync: generateBackupCodes,
    isPending: isGenerating,
    reset: resetGeneration,
  } = useGenerateBackupCodes(authClient as TwoFactorAuthClient, {
    onSuccess: (data) => {
      setCodes(data.backupCodes);
      toastManager.add({
        type: "success",
        title: twoFactorLocalization.backupCodesRegenerated,
      });
    },
  });

  const isPending = isGenerating || isResolvingPasswordRequirement;

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      if (codes.length) {
        handleOpenChange(false);
        return;
      }
      await generateBackupCodes(
        requiresPassword ? { password: value.password } : {},
      );
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setCodes([]);
      form.reset();
      // Clears the resolved backup codes from the mutation cache.
      resetGeneration();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {twoFactorLocalization.backupCodes}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {codes.length || !requiresPassword
              ? twoFactorLocalization.backupCodesDescription
              : twoFactorLocalization.passwordConfirmation}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form.AppForm>
          <form.AuthFormRoot className="contents">
            {codes.length ? (
              <div className="px-6 pb-6">
                <BackupCodes codes={codes} />
              </div>
            ) : (
              requiresPassword && (
                <div className="px-6 pb-6">
                  <form.AppField name="password">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor="regenerate-backup-codes-password">
                          {localization.auth.password}
                        </FieldLabel>

                        <Input
                          id="regenerate-backup-codes-password"
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
              )
            )}

            <AlertDialogFooter>
              {!codes.length && (
                <AlertDialogClose
                  disabled={isPending}
                  render={
                    <Button type="button" variant="ghost">
                      {localization.settings.cancel}
                    </Button>
                  }
                />
              )}

              <form.AuthFormSubmitButton
                isPending={isPending}
                disabled={isPending}
              >
                {codes.length
                  ? twoFactorLocalization.done
                  : twoFactorLocalization.regenerateBackupCodes}
              </form.AuthFormSubmitButton>
            </AlertDialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
