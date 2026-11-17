"use client";

import { useAuthPlugin } from "@better-auth-ui/react";
import { Fingerprint } from "lucide-react";

import { Button } from "@theo/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theo/ui/empty";
import { passkeyPlugin } from "@theo/ui/auth/plugins/passkey-plugin";

export type PasskeysEmptyProps = {
  onAddPress: () => void;
};

export function PasskeysEmpty({ onAddPress }: PasskeysEmptyProps) {
  const { localization: passkeyLocalization } = useAuthPlugin(passkeyPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Fingerprint />
        </EmptyMedia>
        <EmptyTitle>{passkeyLocalization.noPasskeys}</EmptyTitle>
        <EmptyDescription>
          {passkeyLocalization.passkeysDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" size="sm" onClick={onAddPress}>
          {passkeyLocalization.addPasskey}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
