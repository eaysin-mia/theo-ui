"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useListOrganizations } from "@better-auth-ui/react/plugins/organization";
import { Fragment, useState } from "react";

import { Button } from "@theo/ui/components/button";
import {
  Card,
  CardAction,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/components/card";
import { Separator } from "@theo/ui/components/separator";
import { organizationPlugin } from "@theo/ui/lib/auth/organization-plugin";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { OrganizationRow } from "./organization-row";
import { OrganizationViewSkeleton } from "./organization-view-skeleton";
import { OrganizationsEmpty } from "./organizations-empty";

export type OrganizationsProps = {
  className?: string;
};

/**
 * Lists organizations the user belongs to (via `useListOrganizations`): loading skeleton,
 * empty state with create, or a card of rows with a Manage control per organization.
 * Owns `CreateOrganizationDialog` open state and the create actions.
 */
export function Organizations({ className }: OrganizationsProps) {
  const { authClient } = useAuth<OrganizationAuthClient>();
  const {
    allowOrganizationCreation,
    localization: organizationLocalization,
    organizationLimit,
  } = useAuthPlugin(organizationPlugin);

  const [createOpen, setCreateOpen] = useState(false);

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient);
  const canCreate =
    allowOrganizationCreation &&
    (organizationLimit === undefined ||
      (organizations?.length ?? 0) < organizationLimit);

  return (
    <>
      <Card className={className}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{organizationLocalization.organizations}</CardTitle>
          {allowOrganizationCreation && Boolean(organizations?.length) && (
            <CardAction>
              <Button
                size="sm"
                disabled={organizationsPending || !canCreate}
                onClick={() => setCreateOpen(true)}
              >
                {organizationLocalization.createOrganization}
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardPanel className="p-0">
          {organizationsPending ? (
            <div role="list" className="flex flex-col">
              <div role="listitem" className="p-4">
                <OrganizationViewSkeleton />
              </div>
            </div>
          ) : !organizations?.length ? (
            <OrganizationsEmpty
              canCreate={canCreate}
              onCreatePress={() => setCreateOpen(true)}
            />
          ) : (
            <div role="list" className="flex flex-col">
              {organizations.map((organization, index) => (
                <Fragment key={organization.id}>
                  {index > 0 && <Separator />}
                  <OrganizationRow organization={organization} />
                </Fragment>
              ))}
            </div>
          )}
        </CardPanel>
      </Card>

      {canCreate && (
        <CreateOrganizationDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </>
  );
}
