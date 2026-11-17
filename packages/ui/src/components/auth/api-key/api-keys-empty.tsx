"use client";

import { useAuthPlugin } from "@better-auth-ui/react";
import { Key } from "lucide-react";

import { Button } from "@theo/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theo/ui/empty";
import { apiKeyPlugin } from "@theo/ui/auth/plugins/api-key-plugin";

export type ApiKeysEmptyProps = {
  onCreatePress: () => void;
  hideCreate?: boolean;
};

export function ApiKeysEmpty({ onCreatePress, hideCreate }: ApiKeysEmptyProps) {
  const { localization: apiKeyLocalization } = useAuthPlugin(apiKeyPlugin);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Key />
        </EmptyMedia>
        <EmptyTitle>{apiKeyLocalization.noApiKeys}</EmptyTitle>
        <EmptyDescription>
          {apiKeyLocalization.apiKeysDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {!hideCreate && (
          <Button type="button" size="sm" onClick={onCreatePress}>
            {apiKeyLocalization.createApiKey}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
