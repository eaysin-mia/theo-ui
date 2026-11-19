"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useDeleteOrganization } from "@better-auth-ui/react/plugins/organization";
import type { Organization } from "better-auth/client";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "theo-ui/components/alert-dialog";
import { Button } from "theo-ui/components/button";
import { Card, CardPanel } from "theo-ui/components/card";
import { organizationPlugin } from "theo-ui/lib/auth/organization-plugin";
import { useAuthForm } from "../auth-form";
import { OrganizationView } from "./organization-view";

export type DeleteOrganizationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
};

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: DeleteOrganizationDialogProps) {
  const { authClient, basePaths, localization, navigate } =
    useAuth<OrganizationAuthClient>();
  const {
    localization: organizationLocalization,
    viewPaths: organizationPluginViewPaths,
  } = useAuthPlugin(organizationPlugin);

  const { mutateAsync: deleteOrganization, isPending } = useDeleteOrganization(
    authClient,
    {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(organizationLocalization.organizationDeleted);

        navigate({
          to: `${basePaths.settings}/${organizationPluginViewPaths.settings.organizations}`,
          replace: true,
        });
      },
    },
  );

  const form = useAuthForm({
    defaultValues: {},
    onSubmit: async () => {
      await deleteOrganization({ organizationId: organization.id });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {organizationLocalization.deleteOrganization}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {organizationLocalization.deleteOrganizationDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form.AppForm>
          <form.AuthFormRoot className="contents">
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
                  <Button type="button" variant="ghost">
                    {localization.settings.cancel}
                  </Button>
                }
              />

              <form.AuthFormSubmitButton
                isPending={isPending}
                variant="destructive"
                disabled={isPending}
              >
                {organizationLocalization.deleteOrganization}
              </form.AuthFormSubmitButton>
            </AlertDialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
