"use client";

import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@theo/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theo/ui/empty";
import { Skeleton } from "@theo/ui/skeleton";
import { twoFactorPlugin } from "@theo/ui/auth/plugins/two-factor-plugin";
import { DisableTwoFactorDialog } from "@theo/ui/auth/two-factor/disable-two-factor-dialog";
import { EnableTwoFactorDialog } from "@theo/ui/auth/two-factor/enable-two-factor-dialog";
import { RegenerateBackupCodesDialog } from "@theo/ui/auth/two-factor/regenerate-backup-codes-dialog";

export type TwoFactorSettingsProps = {
  className?: string;
};

/**
 * Security-settings card for enrolling in and managing two-factor auth.
 *
 * Reads `user.twoFactorEnabled` from the session — the field the Better Auth
 * two-factor plugin adds — so the card reflects enrollment without an extra
 * request.
 *
 * @param className - Additional CSS classes applied to the card.
 */
export function TwoFactorSettings({ className }: TwoFactorSettingsProps) {
  const { authClient } = useAuth();
  const {
    backupCodes: backupCodesEnabled,
    localization: twoFactorLocalization,
  } = useAuthPlugin(twoFactorPlugin);

  const { data: session, isPending } = useSession(authClient);
  const isEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled,
  );

  const [enableOpen, setEnableOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  return (
    <>
      <Card className={className}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{twoFactorLocalization.twoFactor}</CardTitle>
          <CardDescription>
            Add an additional layer of security to your account with two-factor
            authentication.
          </CardDescription>
          {isEnabled && (
            <CardAction>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => setDisableOpen(true)}
              >
                {twoFactorLocalization.disableTwoFactor}
              </Button>
            </CardAction>
          )}
        </CardHeader>

        {!isPending && !isEnabled ? (
          <CardPanel className="p-0">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShieldCheck />
                </EmptyMedia>
                <EmptyTitle>
                  {twoFactorLocalization.twoFactorDisabled}
                </EmptyTitle>
                <EmptyDescription>
                  {twoFactorLocalization.twoFactorDescription}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" onClick={() => setEnableOpen(true)}>
                  {twoFactorLocalization.enableTwoFactor}
                </Button>
              </EmptyContent>
            </Empty>
          </CardPanel>
        ) : (
          <CardPanel className="flex flex-col gap-4">
            {isPending ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              <p className="text-sm font-medium">
                {twoFactorLocalization.twoFactorEnabled}
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              {twoFactorLocalization.twoFactorDescription}
            </p>

            {isEnabled && backupCodesEnabled && (
              <Button
                className="self-start"
                size="sm"
                variant="outline"
                onClick={() => setRegenerateOpen(true)}
              >
                {twoFactorLocalization.regenerateBackupCodes}
              </Button>
            )}
          </CardPanel>
        )}
      </Card>

      <EnableTwoFactorDialog open={enableOpen} onOpenChange={setEnableOpen} />
      <DisableTwoFactorDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
      />
      <RegenerateBackupCodesDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
      />
    </>
  );
}
