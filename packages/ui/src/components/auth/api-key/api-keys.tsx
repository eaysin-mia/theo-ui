"use client";

import { getLookaheadPage } from "@better-auth-ui/core";
import type {
  ApiKeyAuthClient,
  ListedApiKey,
} from "@better-auth-ui/core/plugins/api-key";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useListApiKeys } from "@better-auth-ui/react/plugins/api-key";
import {
  createTableHook,
  rowPaginationFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
} from "@tanstack/react-table";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Button } from "@theo/ui/components/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/components/card";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@theo/ui/components/select";
import { Separator } from "@theo/ui/components/separator";
import { apiKeyPlugin } from "@theo/ui/lib/auth/api-key-plugin";
import { useServerTableState } from "../server-table-state";
import { ApiKey } from "./api-key";
import { ApiKeySkeleton } from "./api-key-skeleton";
import { ApiKeysEmpty } from "./api-keys-empty";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

const { createAppColumnHelper, useAppTable: useApiKeyTable } = createTableHook({
  enableMultiSort: false,
  enableSortingRemoval: false,
  sortDescFirst: false,
  features: tableFeatures({ rowPaginationFeature, rowSortingFeature }),
});

const apiKeyColumnHelper = createAppColumnHelper<ListedApiKey>();
const apiKeyColumns = apiKeyColumnHelper.columns([
  apiKeyColumnHelper.accessor("createdAt", { id: "createdAt" }),
  apiKeyColumnHelper.accessor("name", { id: "name" }),
]);
const EMPTY_API_KEYS: ListedApiKey[] = [];
const INITIAL_API_KEY_SORTING: SortingState = [{ id: "createdAt", desc: true }];

export type ApiKeysProps = {
  className?: string;
  /** Scope the list and create payload to an organization. */
  organizationId?: string;
  /** Force the loading skeleton and disable the list query. */
  isPending?: boolean;
  /** Hide the "Create API key" button (header + empty state). */
  hideCreate?: boolean;
  /** Hide the per-row delete button on listed keys. */
  hideDelete?: boolean;
  /** Hide the per-row edit button on listed keys. */
  hideUpdate?: boolean;
};

export function ApiKeys({
  className,
  organizationId,
  isPending: isPendingProp,
  hideCreate,
  hideDelete,
  hideUpdate,
}: ApiKeysProps) {
  const { authClient } = useAuth<ApiKeyAuthClient>();
  const { localization: apiKeyLocalization, pageSize } =
    useAuthPlugin(apiKeyPlugin);
  const tableState = useServerTableState({
    initialSorting: INITIAL_API_KEY_SORTING,
    pageSize,
  });
  const { pagination, setPagination, sorting } = tableState;
  const primarySort = sorting[0];
  const sortBy = primarySort?.id === "name" ? "name" : "createdAt";
  const sortDirection = primarySort?.desc ? "desc" : "asc";
  const sort = `${sortBy}:${sortDirection}`;
  const sortItems = [
    { label: apiKeyLocalization.newest, value: "createdAt:desc" },
    { label: apiKeyLocalization.oldest, value: "createdAt:asc" },
    { label: apiKeyLocalization.nameAscending, value: "name:asc" },
    { label: apiKeyLocalization.nameDescending, value: "name:desc" },
  ];

  const {
    data: listData,
    isPending: isListPending,
    isSuccess: isListSuccess,
  } = useListApiKeys(authClient, {
    enabled: !isPendingProp,
    query: {
      limit: pagination.pageSize + 1,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy,
      sortDirection,
      ...(organizationId ? { organizationId, configId: "organization" } : {}),
    },
  });

  const isPending = isPendingProp || isListPending;
  const page = useMemo(
    () =>
      getLookaheadPage(
        listData?.apiKeys ?? EMPTY_API_KEYS,
        pagination.pageSize,
      ),
    [listData?.apiKeys, pagination.pageSize],
  );
  useEffect(() => {
    if (
      isListSuccess &&
      !isPendingProp &&
      pagination.pageIndex > 0 &&
      page.rows.length === 0
    ) {
      setPagination((current) => ({
        ...current,
        pageIndex: Math.max(0, current.pageIndex - 1),
      }));
    }
  }, [
    isListSuccess,
    isPendingProp,
    page.rows.length,
    pagination.pageIndex,
    setPagination,
  ]);
  const table = useApiKeyTable(
    {
      atoms: tableState.atoms,
      columns: apiKeyColumns,
      data: page.rows,
      getRowId: (apiKey) => apiKey.id,
      manualPagination: true,
      pageCount: -1,
      manualSorting: true,
    },
    () => null,
  );

  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <Card className={className}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{apiKeyLocalization.apiKeys}</CardTitle>
          <CardDescription>
            Manage secret API keys for programmatic access and external
            services.
          </CardDescription>
          {Boolean(page.rows.length) && (
            <CardAction>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Select
                  items={sortItems}
                  value={sort}
                  onValueChange={(value) => {
                    const [id = "createdAt", direction = "desc"] = (
                      value ?? "createdAt:desc"
                    ).split(":");
                    table.setSorting([{ id, desc: direction === "desc" }]);
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label={apiKeyLocalization.sortBy}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    <SelectGroup>
                      {sortItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectPopup>
                </Select>

                {!hideCreate && (
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => setCreateOpen(true)}
                  >
                    {apiKeyLocalization.createApiKey}
                  </Button>
                )}
              </div>
            </CardAction>
          )}
        </CardHeader>

        <CardPanel className="p-0">
          {isPending ? (
            <ApiKeySkeleton />
          ) : page.rows.length === 0 ? (
            <ApiKeysEmpty
              onCreatePress={() => setCreateOpen(true)}
              hideCreate={hideCreate}
            />
          ) : (
            <div role="list" className="flex flex-col">
              {table.getRowModel().rows.map((row, index) => (
                <Fragment key={row.id}>
                  {index > 0 && <Separator />}
                  <ApiKey
                    apiKey={row.original}
                    hideDelete={hideDelete}
                    hideUpdate={hideUpdate}
                    organizationId={organizationId}
                  />
                </Fragment>
              ))}
            </div>
          )}
        </CardPanel>

        {(pagination.pageIndex > 0 || page.hasNextPage) && (
          <CardFooter className="justify-end gap-2 border-t bg-muted/40">
            <Button
              variant="outline"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              {apiKeyLocalization.previousPage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!page.hasNextPage}
              onClick={() => table.nextPage()}
            >
              {apiKeyLocalization.nextPage}
            </Button>
          </CardFooter>
        )}
      </Card>

      {!hideCreate && (
        <CreateApiKeyDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          organizationId={organizationId}
        />
      )}
    </>
  );
}
