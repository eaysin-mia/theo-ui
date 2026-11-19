"use client";

import {
  useAuth,
  useRevokeOtherSessions,
  useRevokeSessions,
} from "@better-auth-ui/react";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toastManager } from "theoui/components/toast";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "theoui/components/alert-dialog";
import { Button } from "theoui/components/button";
import { CardFooter } from "theoui/components/card";
import { Spinner } from "theoui/components/spinner";

type PendingAction = "other" | "all";

export function SessionActions(props: { hasOtherSessions: boolean }) {
  const { authClient, basePaths, localization, navigate, viewPaths } =
    useAuth();
  const [action, setAction] = useState<PendingAction | null>(null);

  const revokeOtherSessions = useRevokeOtherSessions(authClient, {
    onSuccess: () => {
      toastManager.add({
        type: "success",
        title: localization.settings.signOutOtherDevicesSuccess,
      });
      setAction(null);
    },
  });
  const revokeSessions = useRevokeSessions(authClient, {
    onSuccess: () =>
      navigate({
        to: `${basePaths.auth}/${viewPaths.auth.signIn}`,
        replace: true,
      }),
  });

  const isPending = revokeOtherSessions.isPending || revokeSessions.isPending;
  const isEverywhere = action === "all";

  return (
    <>
      <CardFooter className="flex flex-col-reverse gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-end sm:p-6">
        <Button
          className="w-full sm:w-auto"
          disabled={!props.hasOtherSessions || isPending}
          onClick={() => setAction("other")}
          size="sm"
          type="button"
          variant="outline"
        >
          {localization.settings.signOutOtherDevices}
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => setAction("all")}
          size="sm"
          type="button"
          variant="destructive"
        >
          {localization.settings.signOutEverywhere}
        </Button>
      </CardFooter>

      <AlertDialog
        open={action !== null}
        onOpenChange={(open) => !open && !isPending && setAction(null)}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEverywhere
                ? localization.settings.signOutEverywhere
                : localization.settings.signOutOtherDevices}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEverywhere
                ? localization.settings.signOutEverywhereDescription
                : localization.settings.signOutOtherDevicesDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              disabled={isPending}
              render={<Button variant="ghost" />}
            >
              {localization.settings.cancel}
            </AlertDialogClose>
            <Button
              disabled={isPending}
              onClick={() =>
                isEverywhere
                  ? revokeSessions.mutate()
                  : revokeOtherSessions.mutate()
              }
              type="button"
              variant={isEverywhere ? "destructive" : "default"}
            >
              {isPending && <Spinner />}
              {isEverywhere
                ? localization.settings.signOutEverywhere
                : localization.settings.signOutOtherDevices}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
}
