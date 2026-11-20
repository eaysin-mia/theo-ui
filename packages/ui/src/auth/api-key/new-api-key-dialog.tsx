"use client";

import {
  useAuth,
  useAuthPlugin,
  useCopyToClipboard,
} from "@better-auth-ui/react";
import { Check, Copy, Key } from "lucide-react";
import { toastManager } from "#components/toast";

import { Button } from "#components/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "#components/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#components/input-group";
import { Label } from "#components/label";
import { apiKeyPlugin } from "#lib/auth/api-key-plugin";

export type NewApiKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string | null;
  secretKey: string | null;
};

export function NewApiKeyDialog({
  open,
  onOpenChange,
  name,
  secretKey,
}: NewApiKeyDialogProps) {
  const { localization } = useAuth();
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin);

  const { copied, copy, reset } = useCopyToClipboard({
    onError: () => {
      toastManager.add({
        type: "error",
        title: localization.errors.copyFailed,
      });
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  const copySecretKey = async () => {
    if (!secretKey) return;

    await copy(secretKey);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key />
            {apiKeyLocalization.newApiKey}
          </DialogTitle>

          <DialogDescription>
            {apiKeyLocalization.newApiKeyWarning}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-api-key-secret">
            {name || apiKeyLocalization.apiKey}
          </Label>

          <InputGroup>
            <InputGroupInput
              id="new-api-key-secret"
              value={secretKey ?? ""}
              readOnly
              className="font-mono text-xs"
            />

            <InputGroupAddon align="inline-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={
                  copied
                    ? localization.settings.copiedToClipboard
                    : localization.settings.copyToClipboard
                }
                onClick={copySecretKey}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => handleOpenChange(false)}>
            {apiKeyLocalization.dismissNewKey}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
