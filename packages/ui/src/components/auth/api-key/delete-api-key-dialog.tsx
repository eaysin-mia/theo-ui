"use client";

import type {
  ApiKeyAuthClient,
  ListedApiKey,
} from "@better-auth-ui/core/plugins/api-key";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useDeleteApiKey } from "@better-auth-ui/react/plugins/api-key";
import { Key } from "lucide-react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "theo-ui/components/alert-dialog";
import { Button } from "theo-ui/components/button";
import { Spinner } from "theo-ui/components/spinner";
import { apiKeyPlugin } from "theo-ui/lib/auth/api-key-plugin";

export type DeleteApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ListedApiKey;
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string;
};

export function DeleteApiKeyDialog({
  open,
  onOpenChange,
  apiKey,
  organizationId,
}: DeleteApiKeyDialogProps) {
  const { authClient, localization } = useAuth<ApiKeyAuthClient>();
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin);
  const preview = `${apiKey.start}${"*".repeat(16)}`;
  const { mutate: deleteApiKey, isPending: isDeleting } = useDeleteApiKey(
    authClient,
    {
      onSuccess: () => onOpenChange(false),
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>{apiKeyLocalization.deleteApiKey}</AlertDialogTitle>
          <AlertDialogDescription>
            {apiKeyLocalization.deleteApiKeyWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5 px-6 pb-6">
          <span className="text-sm font-medium">
            {apiKey.name || apiKeyLocalization.apiKey}
          </span>
          <code className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
            {preview}
          </code>
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
            onClick={() =>
              deleteApiKey({
                keyId: apiKey.id,
                ...(organizationId ? { configId: "organization" } : {}),
              })
            }
          >
            {isDeleting && <Spinner />}

            {apiKeyLocalization.deleteApiKey}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
