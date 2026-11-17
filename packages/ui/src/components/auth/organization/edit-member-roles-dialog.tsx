"use client";

import { validateMinimumItems } from "@better-auth-ui/core";
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { parseMemberRoles } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useUpdateMemberRole } from "@better-auth-ui/react/plugins/organization";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@theo/ui/button";
import { Checkbox } from "@theo/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@theo/ui/dialog";
import { Fieldset, FieldsetLegend } from "@theo/ui/fieldset";
import {
  RadioGroup,
  RadioGroupItem,
} from "@theo/ui/radio-group";
import { organizationPlugin } from "@theo/ui/auth/plugins/organization-plugin";
import { useAuthForm } from "@theo/ui/auth/auth-form";

export type EditMemberRolesDialogProps = {
  member: {
    id: string;
    role?: string | null;
  };
  onOpenChange: (open: boolean) => void;
  open: boolean;
  organizationId: string;
  roles: Array<[string, string]>;
  protectedRole?: string;
  protectedRoleRemovalDisabled?: boolean;
};

const selectedMemberRoles = (
  memberRole: string | null | undefined,
  allowMultipleRoles: boolean,
  protectedRole?: string,
) => {
  const parsedRoles = parseMemberRoles(memberRole);

  if (allowMultipleRoles) return parsedRoles;

  const selectedRole =
    protectedRole && parsedRoles.includes(protectedRole)
      ? protectedRole
      : parsedRoles[0];

  return selectedRole ? [selectedRole] : [];
};

export function EditMemberRolesDialog({
  member,
  onOpenChange,
  open,
  organizationId,
  roles,
  protectedRole,
  protectedRoleRemovalDisabled,
}: EditMemberRolesDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>();
  const { allowMultipleRoles, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin);
  const { mutateAsync: updateMemberRole, isPending } = useUpdateMemberRole(
    authClient,
    {
      onSuccess: () => {
        toast.success(organizationLocalization.memberRoleUpdated);
        onOpenChange(false);
      },
    },
  );
  const form = useAuthForm({
    defaultValues: {
      roles: selectedMemberRoles(
        member.role,
        allowMultipleRoles,
        protectedRole,
      ),
    },
    onSubmit: async ({ value }) => {
      if (value.roles.length === 0) return;

      try {
        await updateMemberRole({
          memberId: member.id,
          organizationId,
          role: value.roles,
        });
      } catch {
        // The mutation reports the error through its configured handler.
      }
    },
  });

  useEffect(() => {
    if (open)
      form.reset({
        roles: selectedMemberRoles(
          member.role,
          allowMultipleRoles,
          protectedRole,
        ),
      });
  }, [allowMultipleRoles, form.reset, member.role, open, protectedRole]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck />
            {organizationLocalization.changeMemberRole}
          </DialogTitle>
          <DialogDescription>
            {organizationLocalization.changeMemberRoleDescription}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.AuthFormRoot className="contents">
            <DialogPanel>
              <form.AppField
                name="roles"
                mode="array"
                validators={{
                  onChange: ({ value }) =>
                    validateMinimumItems(
                      value,
                      1,
                      organizationLocalization.selectAtLeastOneRole,
                    ),
                }}
              >
                {(field) => {
                  const selectedRoles = field.state.value;
                  const protectedRoleSelected =
                    !allowMultipleRoles &&
                    protectedRoleRemovalDisabled &&
                    protectedRole !== undefined &&
                    selectedRoles.includes(protectedRole);
                  const roleOptions = roles.map(([role, label]) => {
                    const checked = selectedRoles.includes(role);
                    const disabled =
                      isPending ||
                      (allowMultipleRoles &&
                        checked &&
                        selectedRoles.length === 1) ||
                      (protectedRoleSelected && role !== protectedRole) ||
                      (role === protectedRole &&
                        checked &&
                        protectedRoleRemovalDisabled);
                    const id = `member-${member.id}-role-${role}`;

                    return (
                      <label
                        key={role}
                        htmlFor={id}
                        data-disabled={disabled || undefined}
                        className="flex cursor-pointer items-center justify-between rounded-md border p-3 data-disabled:cursor-not-allowed data-disabled:opacity-50"
                      >
                        <span className="text-sm font-medium">{label}</span>
                        {allowMultipleRoles ? (
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            id={id}
                            onCheckedChange={(next) => {
                              if (next === true && !checked) {
                                field.pushValue(role);
                                return;
                              }

                              const index = selectedRoles.indexOf(role);
                              if (index >= 0) field.removeValue(index);
                            }}
                          />
                        ) : (
                          <RadioGroupItem
                            disabled={disabled}
                            id={id}
                            value={role}
                          />
                        )}
                      </label>
                    );
                  });

                  return (
                    <>
                      {allowMultipleRoles ? (
                        <Fieldset>
                          <FieldsetLegend className="sr-only">
                            {organizationLocalization.changeMemberRole}
                          </FieldsetLegend>
                          <div className="flex flex-col gap-2">
                            {roleOptions}
                          </div>
                        </Fieldset>
                      ) : (
                        <RadioGroup
                          disabled={isPending}
                          onValueChange={(role) => field.handleChange([role])}
                          value={selectedRoles[0] ?? ""}
                        >
                          {roleOptions}
                        </RadioGroup>
                      )}

                      <field.AuthFormFieldError />
                    </>
                  );
                }}
              </form.AppField>
            </DialogPanel>

            <DialogFooter>
              <DialogClose
                disabled={isPending}
                render={
                  <Button variant="outline" type="button">
                    {localization.settings.cancel}
                  </Button>
                }
              />
              <form.AuthFormSubmitButton disabled={isPending}>
                {localization.settings.saveChanges}
              </form.AuthFormSubmitButton>
            </DialogFooter>
          </form.AuthFormRoot>
        </form.AppForm>
      </DialogPopup>
    </Dialog>
  );
}
