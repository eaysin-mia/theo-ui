"use client";

import { getProviderId } from "@better-auth-ui/core";
import { useAuth, useListAccounts } from "@better-auth-ui/react";
import { Fragment } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "theoui/components/card";
import { Separator } from "theoui/components/separator";
import { Skeleton } from "theoui/components/skeleton";
import { LinkedAccount } from "./linked-account";

export type LinkedAccountsProps = {
  className?: string;
};

/**
 * Render a card showing linked social accounts and available social providers to link.
 *
 * Linked accounts (excluding the "credential" provider) are shown with an unlink control;
 * available providers are shown with a link control. Button states and labels reflect
 * ongoing link/unlink activity and use localization for provider-specific text.
 *
 * @returns A JSX element containing the linked accounts card
 */
export function LinkedAccounts({ className }: LinkedAccountsProps) {
  const {
    authClient,
    allowUnlinkingAllAccounts,
    localization,
    multipleAccountsPerProvider,
    socialProviders,
  } = useAuth();

  const { data: accounts, isPending } = useListAccounts(authClient);

  const linkedAccounts = accounts?.filter(
    (account) => account.providerId !== "credential",
  );
  const canUnlink =
    allowUnlinkingAllAccounts === true || (accounts?.length ?? 0) > 1;

  const linkedProviderIds = new Set(linkedAccounts?.map((a) => a.providerId));

  const availableProviders =
    multipleAccountsPerProvider === false
      ? socialProviders?.filter(
          (provider) => !linkedProviderIds.has(getProviderId(provider)),
        )
      : socialProviders;

  const allRows = [
    ...(linkedAccounts?.map((account) => ({
      key: account.id,
      account,
      provider:
        socialProviders?.find(
          (provider) => getProviderId(provider) === account.providerId,
        ) ?? account.providerId,
    })) ?? []),
    ...(availableProviders?.map((provider) => ({
      key: getProviderId(provider),
      account: undefined,
      provider,
    })) ?? []),
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{localization.settings.linkedAccounts}</CardTitle>
        <CardDescription>
          Connect your social accounts to sign in faster with one click.
        </CardDescription>
      </CardHeader>

      <CardPanel className="p-0">
        <div role="list" className="flex flex-col">
          {isPending
            ? socialProviders?.map((provider, index) => (
                <Fragment key={getProviderId(provider)}>
                  {index > 0 && <Separator />}
                  <AccountRowSkeleton />
                </Fragment>
              ))
            : allRows.map((row, index) => (
                <Fragment key={row.key}>
                  {index > 0 && <Separator />}
                  <LinkedAccount
                    account={row.account}
                    canUnlink={canUnlink}
                    provider={row.provider}
                  />
                </Fragment>
              ))}
        </div>
      </CardPanel>
    </Card>
  );
}

function AccountRowSkeleton() {
  return (
    <div role="listitem" className="flex items-center gap-3 p-4">
      <Skeleton className="size-8 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
