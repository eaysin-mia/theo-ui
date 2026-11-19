"use client";

import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { Fingerprint, Pencil, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@theo/ui/components/button";
import { passkeyPlugin } from "@theo/ui/lib/auth/passkey-plugin";

import {
  DeletePasskeyDialog,
  type ListedPasskey,
} from "./delete-passkey-dialog";
import { RenamePasskeyDialog } from "./rename-passkey-dialog";

export type PasskeyProps = {
  passkey: ListedPasskey;
};

export function Passkey({ passkey }: PasskeyProps) {
  const { localization } = useAuth();
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const passkeyName = passkey.name || passkeyLocalization.passkey;

  return (
    <div
      role="listitem"
      className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          <Fingerprint />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate leading-snug font-semibold text-foreground">
            {passkeyName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(passkey.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setRenameOpen(true)}>
          <Pencil />
          {passkeyLocalization.renamePasskey}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label={passkeyLocalization.deletePasskey.replace(
            "{{name}}",
            passkeyName,
          )}
        >
          <X />
          {localization.settings.delete}
        </Button>

        <DeletePasskeyDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          passkey={passkey}
        />
        <RenamePasskeyDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          passkey={passkey}
        />
      </div>
    </div>
  );
}
