"use client";

import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useListPasskeys } from "@better-auth-ui/react/plugins/passkey";
import { Fragment, useState } from "react";

import { Button } from "@theo/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/card";
import { Separator } from "@theo/ui/separator";
import { passkeyPlugin } from "@theo/ui/auth/plugins/passkey-plugin";

import { AddPasskeyDialog } from "@theo/ui/auth/passkey/add-passkey-dialog";
import { Passkey } from "@theo/ui/auth/passkey/passkey";
import { PasskeySkeleton } from "@theo/ui/auth/passkey/passkey-skeleton";
import { PasskeysEmpty } from "@theo/ui/auth/passkey/passkeys-empty";

export type PasskeysProps = {
  className?: string;
};

export function Passkeys({ className }: PasskeysProps) {
  const { authClient } = useAuth<PasskeyAuthClient>();
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin);

  const { data: passkeys, isPending } = useListPasskeys(authClient);

  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Card className={className}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{passkeyLocalization.passkeys}</CardTitle>
          <CardDescription>
            {passkeyLocalization.passkeysDescription}
          </CardDescription>
          {Boolean(passkeys?.length) && (
            <CardAction>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => setAddOpen(true)}
              >
                {passkeyLocalization.addPasskey}
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardPanel className="p-0">
          {isPending ? (
            <PasskeySkeleton />
          ) : !passkeys?.length ? (
            <PasskeysEmpty onAddPress={() => setAddOpen(true)} />
          ) : (
            <div role="list" className="flex flex-col">
              {passkeys.map((passkey, index) => (
                <Fragment key={passkey.id}>
                  {index > 0 && <Separator />}
                  <Passkey passkey={passkey} />
                </Fragment>
              ))}
            </div>
          )}
        </CardPanel>
      </Card>

      <AddPasskeyDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
