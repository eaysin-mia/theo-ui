"use client";

import {
  authQueryKeys,
  isReauthenticationRequiredError,
  validateStringLength,
} from "@better-auth-ui/core";
import {
  useAuth,
  useAuthPlugin,
  useDeleteUser,
  useListAccounts,
} from "@better-auth-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
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
  AlertDialogTrigger,
} from "@theo/ui/components/alert-dialog";
import { Button, buttonVariants } from "@theo/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/components/card";
import { Field, FieldLabel } from "@theo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@theo/ui/components/input-group";
import { deleteUserPlugin } from "@theo/ui/lib/auth/delete-user-plugin";
import { cn } from "@theo/ui/lib/utils";
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form";
import { ReauthenticationAction } from "../reauthentication";

export type DeleteAccountProps = {
  className?: string;
};

/**
 * Danger-zone card to delete the authenticated account, with a confirmation dialog and toasts.
 */
export function DeleteAccount({ className }: DeleteAccountProps) {
  const { authClient, basePaths, localization, viewPaths, navigate } =
    useAuth();

  const {
    localization: deleteUserLocalization,
    sendDeleteAccountVerification,
  } = useAuthPlugin(deleteUserPlugin);

  const { data: accounts } = useListAccounts(authClient);

  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasCredentialAccount = accounts?.some(
    (account) => account.providerId === "credential",
  );
  const needsPassword = !sendDeleteAccountVerification && hasCredentialAccount;

  const deleteUser = useDeleteUser(authClient, {
    meta: { errorPresentation: "inline" },
  });
  const needsReauthentication = isReauthenticationRequiredError(
    deleteUser.error,
  );

  const form = useAuthForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      await deleteUser.mutateAsync(
        needsPassword ? { password: value.password } : {},
        {
          onSuccess: () => {
            setConfirmOpen(false);
            form.reset();

            if (sendDeleteAccountVerification) {
              toastManager.add({
                type: "success",
                title: deleteUserLocalization.deleteUserVerificationSent,
              });
            } else {
              toastManager.add({
                type: "success",
                title: deleteUserLocalization.deleteUserSuccess,
              });
              queryClient.removeQueries({ queryKey: authQueryKeys.all });
              navigate({
                to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
                replace: true,
              });
            }
          },
        },
      );
    },
  });

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && deleteUser.isPending) return;
    setConfirmOpen(open);
    deleteUser.reset();
    form.reset();
    setIsPasswordVisible(false);
  };

  return (
    <Card className={cn("w-full border-destructive/30", className)}>
      <CardHeader>
        <CardTitle>{deleteUserLocalization.deleteAccount}</CardTitle>
        <CardDescription>
          {deleteUserLocalization.deleteAccountDescription}
        </CardDescription>
      </CardHeader>

      <CardPanel />

      <CardFooter className="justify-end border-t border-destructive/20 bg-destructive/5">
        <AlertDialog open={confirmOpen} onOpenChange={handleDialogOpenChange}>
          <AlertDialogTrigger
            className={cn(
              buttonVariants({ variant: "destructive", size: "sm" }),
            )}
            disabled={!accounts}
          >
            {deleteUserLocalization.deleteAccount}
          </AlertDialogTrigger>

          <AlertDialogPopup>
            {needsReauthentication ? (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {localization.settings.reauthenticationTitle}
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <ReauthenticationAction className="p-0" showTitle={false} />
              </>
            ) : (
              <form.AppForm>
                <form.AuthFormRoot
                  className="flex flex-col gap-6"
                  serverErrorMessage={localization.errors.generic}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {deleteUserLocalization.deleteAccount}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                      {deleteUserLocalization.deleteAccountDescription}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {needsPassword && (
                    <form.AppField
                      name="password"
                      validators={{
                        onChange: ({ value }) =>
                          validateStringLength(value, {
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
                            <FieldLabel htmlFor="delete-password">
                              {localization.auth.password}
                            </FieldLabel>

                            <InputGroup>
                              <InputGroupInput
                                id="delete-password"
                                name={field.name}
                                type={isPasswordVisible ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder={
                                  localization.auth.passwordPlaceholder
                                }
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                disabled={deleteUser.isPending}
                                required
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
                                  title={
                                    isPasswordVisible
                                      ? localization.auth.hidePassword
                                      : localization.auth.showPassword
                                  }
                                  onClick={() => {
                                    setIsPasswordVisible((visible) => !visible);
                                  }}
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
                  )}

                  <form.AuthFormServerError />

                  <AlertDialogFooter>
                    <AlertDialogClose
                      disabled={deleteUser.isPending}
                      render={
                        <Button variant="ghost">
                          {localization.settings.cancel}
                        </Button>
                      }
                    />

                    <form.AuthFormSubmitButton
                      isPending={deleteUser.isPending}
                      variant="destructive"
                      disabled={deleteUser.isPending}
                    >
                      {deleteUserLocalization.deleteAccount}
                    </form.AuthFormSubmitButton>
                  </AlertDialogFooter>
                </form.AuthFormRoot>
              </form.AppForm>
            )}
          </AlertDialogPopup>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
