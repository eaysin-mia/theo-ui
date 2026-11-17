"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useLeaveOrganization } from "@better-auth-ui/react/plugins/organization";
import type { Organization } from "better-auth/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@theo/ui/alert-dialog";
import { Button } from "@theo/ui/button";
import { Card, CardPanel } from "@theo/ui/card";
import { Spinner } from "@theo/ui/spinner";
import { organizationPlugin } from "@theo/ui/auth/plugins/organization-plugin";
import { OrganizationView } from "@theo/ui/auth/organization/organization-view";

export type LeaveOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
};

export function LeaveOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: LeaveOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } =
    useAuth<OrganizationAuthClient>();
  const {
    localization: organizationLocalization,
    viewPaths: organizationPluginViewPaths,
  } = useAuthPlugin(organizationPlugin);

  const { mutate: leaveOrganization, isPending } = useLeaveOrganization(
    authClient,
    {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(organizationLocalization.leftOrganization);

        navigate({
          to: `${basePaths.settings}/${organizationPluginViewPaths.settings.organizations}`,
          replace: true,
        });
      },
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {organizationLocalization.leaveOrganization}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {organizationLocalization.leaveOrganizationDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mx-6 mb-6">
          <Card>
            <CardPanel>
              <OrganizationView organization={organization} hideRole />
            </CardPanel>
          </Card>
        </div>

        <AlertDialogFooter>
          <AlertDialogClose
            disabled={isPending}
            render={
              <Button variant="ghost">{localization.settings.cancel}</Button>
            }
          />

          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              leaveOrganization({ organizationId: organization.id })
            }
          >
            {isPending && <Spinner />}

            {organizationLocalization.leaveOrganization}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
