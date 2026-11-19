"use client";

import type { ListedApiKey } from "@better-auth-ui/core/plugins/api-key";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { Key, Pencil, X } from "lucide-react";
import { useState } from "react";

import { Button } from "theo-ui/components/button";
import { apiKeyPlugin } from "theo-ui/lib/auth/api-key-plugin";
import { DeleteApiKeyDialog } from "./delete-api-key-dialog";
import { EditApiKeyDialog } from "./edit-api-key-dialog";

export type ApiKeyProps = {
  apiKey: ListedApiKey;
  /** Hide the row's delete button (e.g., when caller lacks `apiKey:delete`). */
  hideDelete?: boolean;
  /** Hide the row's edit button (e.g., when caller lacks `apiKey:update`). */
  hideUpdate?: boolean;
  /** Scope the delete payload to an organization (sets `configId`). */
  organizationId?: string;
};

export function ApiKey({
  apiKey,
  hideDelete,
  hideUpdate,
  organizationId,
}: ApiKeyProps) {
  const { localization } = useAuth();
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const preview = `${apiKey.start}${"*".repeat(16)}`;

  return (
    <div
      role="listitem"
      className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4">
          <Key />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="leading-snug font-semibold text-foreground">
            {apiKey.name || apiKeyLocalization.apiKey}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{preview}</p>
          <p className="text-xs text-muted-foreground">
            {apiKeyLocalization.created}{" "}
            {new Date(apiKey.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {apiKey.expiresAt
              ? `${apiKeyLocalization.expires} ${new Date(
                  apiKey.expiresAt,
                ).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`
              : apiKeyLocalization.neverExpires}
          </p>
          <p className="text-xs text-muted-foreground">
            {apiKey.enabled
              ? apiKeyLocalization.enabled
              : apiKeyLocalization.disabled}
            {` · ${apiKeyLocalization.requests}: ${apiKey.requestCount}`}
            {apiKey.remaining === null
              ? ""
              : ` · ${apiKeyLocalization.remaining}: ${apiKey.remaining}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {apiKeyLocalization.lastRequest}:{" "}
            {apiKey.lastRequest
              ? new Date(apiKey.lastRequest).toLocaleString()
              : apiKeyLocalization.neverRequested}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!hideUpdate && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil />
              {apiKeyLocalization.editApiKey}
            </Button>
            <EditApiKeyDialog
              apiKey={apiKey}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
          </>
        )}
        {!hideDelete && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              aria-label={apiKeyLocalization.deleteApiKey}
            >
              <X />
              {localization.settings.delete}
            </Button>

            <DeleteApiKeyDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              apiKey={apiKey}
              organizationId={organizationId}
            />
          </>
        )}
      </div>
    </div>
  );
}
