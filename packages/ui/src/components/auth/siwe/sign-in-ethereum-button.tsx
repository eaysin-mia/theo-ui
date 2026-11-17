"use client";

import {
  type AuthView,
  authMutationKeys,
  validateEmailAddress,
} from "@better-auth-ui/core";
import {
  type SiweAuthClient,
  siweMutationKeys,
} from "@better-auth-ui/core/plugins/siwe";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useSignInSiwe } from "@better-auth-ui/react/plugins/siwe";
import { useIsMutating } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "@theo/ui/button";
import { LastUsedBadge } from "@theo/ui/auth/last-login-method/last-used-badge";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@theo/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@theo/ui/field";
import { Input } from "@theo/ui/input";
import { Spinner } from "@theo/ui/spinner";
import { siwePlugin } from "@theo/ui/auth/plugins/siwe-plugin";
import { cn } from "@theo/ui/utils";
import {
  isAuthFormFieldInvalid,
  runAuthFormAction,
  useAuthForm,
} from "@theo/ui/auth/auth-form";

export type SignInEthereumButtonProps = { view?: AuthView };

export function SignInEthereumButton({ view }: SignInEthereumButtonProps) {
  const { authClient, localization, navigate, redirectTo } =
    useAuth<SiweAuthClient>();
  const plugin = useAuthPlugin(siwePlugin);
  const [open, setOpen] = useState(false);
  const signIn = useSignInSiwe(authClient, {
    connector: plugin.connector,
    domain: plugin.domain,
    uri: plugin.uri,
    statement: plugin.statement,
  });
  const isPending =
    useIsMutating({ mutationKey: authMutationKeys.signIn.all }) +
      useIsMutating({ mutationKey: authMutationKeys.signUp.all }) +
      useIsMutating({ mutationKey: siweMutationKeys.all }) >
    0;

  const complete = async (email?: string) => {
    await signIn.mutateAsync(email ? { email } : undefined, {
      onSuccess: () => {
        setOpen(false);
        navigate({ to: redirectTo });
      },
    });
  };

  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await complete(value.email.trim() || undefined);
    },
  });

  if (view === "signUp") return null;

  return (
    <form.AppForm>
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        className={cn(
          "relative w-full overflow-visible",
          isPending && "pointer-events-none opacity-50",
        )}
        onClick={() => {
          if (plugin.email === "none") {
            void runAuthFormAction(form, () => complete());
            return;
          }
          setOpen(true);
        }}
      >
        {signIn.isPending ? <Spinner /> : <Wallet />}
        {plugin.localization.continueWithEthereum}
        <LastUsedBadge method="siwe" floating />
      </Button>

      {plugin.email === "none" && <form.AuthFormServerError />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet />
              {plugin.localization.continueWithEthereum}
            </DialogTitle>
            <DialogDescription>
              {plugin.localization.emailDescription}
            </DialogDescription>
          </DialogHeader>
          <form.AuthFormRoot className="contents">
            <DialogPanel className="flex flex-col gap-4">
              <form.AppField
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    validateEmailAddress(value, {
                      invalidMessage: localization.auth.invalidEmail,
                      requiredMessage:
                        plugin.email === "required"
                          ? localization.auth.fieldRequired
                          : undefined,
                    }),
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta);
                  return (
                    <Field invalid={isInvalid}>
                      <FieldLabel htmlFor="siwe-email">
                        {plugin.email === "required"
                          ? plugin.localization.email
                          : plugin.localization.emailOptional}
                      </FieldLabel>
                      <Input
                        id="siwe-email"
                        name={field.name}
                        type="email"
                        autoComplete="email"
                        required={plugin.email === "required"}
                        disabled={signIn.isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={isInvalid || undefined}
                      />
                      <FieldDescription>
                        {plugin.localization.emailDescription}
                      </FieldDescription>
                      <field.AuthFormFieldError />
                    </Field>
                  );
                }}
              </form.AppField>
            </DialogPanel>
            <form.AuthFormServerError />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={signIn.isPending}
                onClick={() => setOpen(false)}
              >
                {localization.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton
                isPending={signIn.isPending}
                disabled={signIn.isPending}
              >
                {plugin.localization.signMessage}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </DialogPopup>
      </Dialog>
    </form.AppForm>
  );
}
