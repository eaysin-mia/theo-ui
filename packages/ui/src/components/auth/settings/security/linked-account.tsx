"use client";

import {
  getAuthCallbackURL,
  type AuthSocialProvider,
  getAuthErrorMessage,
  getProviderId,
  getProviderName,
  isReauthenticationRequiredError,
} from "@better-auth-ui/core";

import {
  renderProviderIcon,
  useAccountInfo,
  useAuth,
  useLinkSocial,
  useUnlinkAccount,
} from "@better-auth-ui/react";
import type { Account } from "better-auth";
import { Link2, Link2Off, Plug } from "lucide-react";
import { toastManager } from "theoui/components/toast";

import { Button } from "theoui/components/button";
import {
  Dialog,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "theoui/components/dialog";
import { Skeleton } from "theoui/components/skeleton";
import { Spinner } from "theoui/components/spinner";
import { cn } from "theoui/lib/utils";
import { ReauthenticationAction } from "../../reauthentication";

export type LinkedAccountProps = {
  account?: Account;
  canUnlink?: boolean;
  provider: AuthSocialProvider | string;
};

/**
 * Render a single linked social account row with provider info and link/unlink control.
 *
 * Fetches additional account information from the provider using the accountInfo API
 * and displays the provider name, account details, and a link/unlink button.
 *
 * @param account - The account object containing id, accountId, and providerId
 * @param provider - The provider id
 * @returns A JSX element containing the linked account row
 */
export function LinkedAccount({
  account,
  canUnlink = true,
  provider,
}: LinkedAccountProps) {
  const { authClient, baseURL, localization } = useAuth();

  const { data: accountInfo, isPending: isLoadingInfo } = useAccountInfo(
    authClient,
    { query: { accountId: account?.id ?? "" } },
  );

  const { mutate: linkSocial, isPending: isLinking } =
    useLinkSocial(authClient);

  const unlinkAccount = useUnlinkAccount(authClient, {
    meta: { errorPresentation: "inline" },
    onError: (error) => {
      if (!isReauthenticationRequiredError(error)) {
        const message = getAuthErrorMessage(error, localization);
        if (message) {
          toastManager.add({
            type: "error",
            title: message,
          });
        }
      }
    },
    onSuccess: () =>
      toastManager.add({
        type: "success",
        title: localization.settings.accountUnlinked,
      }),
  });

  const providerId = getProviderId(provider);
  const providerIcon = renderProviderIcon(providerId);
  const providerName = getProviderName(provider);
  const accountData = accountInfo?.data as
    { login?: string; username?: string } | undefined;

  const displayName =
    accountData?.login ||
    accountData?.username ||
    accountInfo?.user?.email ||
    accountInfo?.user?.name ||
    account?.accountId;

  const needsReauthentication = isReauthenticationRequiredError(
    unlinkAccount.error,
  );

  return (
    <>
      <div
        role="listitem"
        className="flex items-center justify-between gap-4 p-4 text-sm"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4",
              !account && "opacity-50",
            )}
          >
            {providerIcon ? providerIcon : <Plug />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate leading-snug font-semibold text-foreground">
              {providerName}
            </p>
            {account && isLoadingInfo ? (
              <Skeleton className="my-0.5 h-3 w-24" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {account
                  ? displayName
                  : localization.settings.linkProvider.replace(
                      "{{provider}}",
                      providerName,
                    )}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {account ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unlinkAccount.mutate({ accountId: account.id })}
              disabled={unlinkAccount.isPending || !canUnlink}
              title={
                canUnlink
                  ? undefined
                  : localization.settings.lastAccountUnlinkingDisabled
              }
              aria-label={localization.settings.unlinkProvider.replace(
                "{{provider}}",
                providerName,
              )}
            >
              {unlinkAccount.isPending ? <Spinner /> : <Link2Off />}
              {localization.settings.unlinkProvider
                .replace("{{provider}}", "")
                .trim()}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                linkSocial({
                  provider: providerId,
                  callbackURL: getAuthCallbackURL(
                    baseURL,
                    window.location.pathname,
                  ),
                })
              }
              disabled={isLinking}
              aria-label={localization.settings.linkProvider.replace(
                "{{provider}}",
                providerName,
              )}
            >
              {isLinking ? <Spinner /> : <Link2 />}
              {localization.settings.link}
            </Button>
          )}
        </div>
      </div>
      {account && (
        <Dialog
          open={needsReauthentication}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) unlinkAccount.reset();
          }}
        >
          <DialogPopup>
            <DialogHeader>
              <DialogTitle className="sr-only">
                {localization.settings.reauthenticationTitle}
              </DialogTitle>
            </DialogHeader>
            <ReauthenticationAction showTitle={false} />
          </DialogPopup>
        </Dialog>
      )}
    </>
  );
}
