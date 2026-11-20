"use client";

import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useDeletePasskey } from "@better-auth-ui/react/plugins/passkey";
import { Fingerprint } from "lucide-react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "#components/alert-dialog";
import { Button } from "#components/button";
import { Field, FieldLabel } from "#components/field";
import { Input } from "#components/input";
import { Spinner } from "#components/spinner";
import { passkeyPlugin } from "#lib/auth/passkey-plugin";

export type ListedPasskey = {
  id: string;
  name?: string | null;
  createdAt: Date;
};

export type DeletePasskeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passkey: ListedPasskey;
};

export function DeletePasskeyDialog({
  open,
  onOpenChange,
  passkey,
}: DeletePasskeyDialogProps) {
  const { authClient, localization } = useAuth<PasskeyAuthClient>();
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin);

  const passkeyName = passkey.name || passkeyLocalization.passkey;
  const previewId = `delete-passkey-preview-${passkey.id}`;

  const { mutate: deletePasskey, isPending: isDeleting } = useDeletePasskey(
    authClient,
    {
      onSuccess: () => onOpenChange(false),
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {passkeyLocalization.deletePasskeyTitle}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {passkeyLocalization.deletePasskeyWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-6 pb-6">
          <Field>
            <FieldLabel htmlFor={previewId}>
              {passkey.name || passkeyLocalization.passkey}
            </FieldLabel>

            <Input
              id={previewId}
              value={passkeyName}
              readOnly
              disabled
              type="text"
            />
          </Field>
        </div>

        <AlertDialogFooter>
          <AlertDialogClose
            disabled={isDeleting}
            render={
              <Button variant="ghost">{localization.settings.cancel}</Button>
            }
          />

          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => deletePasskey({ id: passkey.id })}
          >
            {isDeleting && <Spinner />}

            {passkeyLocalization.deletePasskeyTitle}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
