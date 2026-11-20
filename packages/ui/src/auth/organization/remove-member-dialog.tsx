"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useRemoveMember } from "@better-auth-ui/react/plugins/organization";
import type { Member, User } from "better-auth/client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "#components/alert-dialog";
import { Badge } from "#components/badge";
import { Button } from "#components/button";
import { Card, CardPanel } from "#components/card";
import { Spinner } from "#components/spinner";
import { organizationPlugin } from "#lib/auth/organization-plugin";
import { UserView } from "../user/user-view";

export type RemoveMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member & { user: Partial<User> };
};

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
}: RemoveMemberDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>();
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin);

  const { mutate: removeMember, isPending } = useRemoveMember(authClient, {
    onSuccess: () => {
      onOpenChange(false);
      toast.success(organizationLocalization.memberRemoved);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {organizationLocalization.removeMember}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {organizationLocalization.removeMemberWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mx-6 mb-6">
          <Card>
            <CardPanel className="flex flex-row items-center justify-between gap-2">
              <UserView user={member.user} />

              <Badge variant="outline">
                {roles?.[member.role] ?? member.role}
              </Badge>
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
              removeMember({
                memberIdOrEmail: member.id,
                organizationId: member.organizationId,
              })
            }
          >
            {isPending && <Spinner />}

            {organizationLocalization.removeMember}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
