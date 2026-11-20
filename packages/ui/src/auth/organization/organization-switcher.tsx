"use client";

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react";
import {
  useActiveOrganization,
  useListOrganizations,
  useSetActiveOrganization,
} from "@better-auth-ui/react/plugins/organization";
import type { Organization } from "better-auth/client";
import {
  ChevronsUpDown,
  PlusCircle,
  Settings as SettingsIcon,
} from "lucide-react";
import { type ComponentProps, type ReactElement, useState } from "react";

import { buttonVariants } from "theoui/components/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "theoui/components/menu";
import { organizationPlugin } from "theoui/lib/auth/organization-plugin";
import { cn } from "theoui/lib/utils";
import { UserView } from "../user/user-view";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { OrganizationView } from "./organization-view";

/** Props for the `OrganizationSwitcher` component. */
export type OrganizationSwitcherProps = {
  className?: string;
  align?: "center" | "end" | "start";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  trigger?: ReactElement<ComponentProps<typeof MenuTrigger>>;
  hideCreate?: boolean;
  hidePersonal?: boolean;
  hideSettings?: boolean;
  hideSlug?: boolean;
  setActive?: (organization: Organization | null) => void;
};

/**
 * Renders an organizations dropdown with a trigger button,
 * header summary, and a menu of organizations to switch to.
 *
 * Built with Coss UI Menu primitives.
 */
export function OrganizationSwitcher({
  align,
  className,
  hideCreate,
  hidePersonal,
  hideSettings,
  hideSlug: hideSlugProp,
  setActive,
  side,
  sideOffset,
  trigger,
}: OrganizationSwitcherProps) {
  const { authClient, basePaths, Link, localization, navigate, viewPaths } =
    useAuth<OrganizationAuthClient>();
  const { data: session, isPending: sessionPending } = useSession(authClient);
  const {
    hideSlug: pluginHideSlug,
    localization: organizationLocalization,
    slug,
    slugPrefix,
    viewPaths: organizationViewPaths,
  } = useAuthPlugin(organizationPlugin);

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient);
  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient);
  const { mutate: setActiveOrganization, isPending: setActivePending } =
    useSetActiveOrganization(authClient);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const hideSlug = hideSlugProp ?? pluginHideSlug;

  const isPending =
    sessionPending ||
    activeOrganizationPending ||
    organizationsPending ||
    setActivePending;

  const otherOrganizations =
    organizations?.filter((org) => org.id !== activeOrganization?.id) ?? [];

  const handleSetActive = (organization: Organization | null) => {
    setActive?.(organization);
    setActiveOrganization(
      {
        organizationId: organization?.id ?? null,
      },
      {
        onSuccess: () => {
          if (!organization && !slug) {
            navigate({
              to: `${basePaths.settings}/${organizationViewPaths.settings?.organizations}`,
            });
          }
        },
      },
    );
  };

  const hasOtherEntries =
    (!!activeOrganization && !hidePersonal) || otherOrganizations.length > 0;

  return (
    <>
      <Menu onOpenChange={setDropdownOpen} open={dropdownOpen}>
        {trigger ? (
          trigger
        ) : (
          <MenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-auto px-2 py-2 text-left",
              className,
            )}
            disabled={!session || isPending}
          >
            {isPending ? (
              <OrganizationView hideRole hideSlug={hideSlug} isPending />
            ) : activeOrganization ? (
              <OrganizationView hideRole hideSlug={hideSlug} />
            ) : session && !hidePersonal ? (
              <UserView hideSubtitle={hideSlug} />
            ) : (
              <OrganizationView
                hideRole
                hideSlug={hideSlug}
                organization={{ name: organizationLocalization.organization }}
              />
            )}

            <ChevronsUpDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          </MenuTrigger>
        )}

        <MenuPopup
          align={align}
          className="max-w-svw min-w-64"
          side={side}
          sideOffset={sideOffset}
        >
          {activeOrganization ? (
            <div className="flex items-center justify-between gap-4 px-2 py-2">
              <OrganizationView
                hideRole
                hideSlug={hideSlug}
                organization={activeOrganization}
              />

              {!hideSettings && (
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                  )}
                  href={
                    slug
                      ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.settings}`
                      : `${basePaths.organization}/${organizationViewPaths.organization.settings}`
                  }
                >
                  <SettingsIcon
                    aria-hidden="true"
                    className="text-muted-foreground"
                  />

                  {organizationLocalization.manage}
                </Link>
              )}
            </div>
          ) : !isPending && session?.user && !hidePersonal ? (
            <div className="flex items-center justify-between gap-4 px-2 py-2">
              <UserView hideSubtitle={hideSlug} />

              {!hideSettings && (
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                  )}
                  href={`${basePaths.settings}/${viewPaths.settings.account}`}
                >
                  <SettingsIcon
                    aria-hidden="true"
                    className="text-muted-foreground"
                  />

                  {localization.settings.settings}
                </Link>
              )}
            </div>
          ) : null}

          <MenuSeparator />

          {!!activeOrganization && !hidePersonal && (
            <MenuItem onClick={() => handleSetActive(null)}>
              <UserView hideSubtitle={hideSlug} />
            </MenuItem>
          )}

          {otherOrganizations.map((organization) => (
            <MenuItem
              key={organization.id}
              onClick={() => handleSetActive(organization)}
            >
              <OrganizationView
                hideRole
                hideSlug={hideSlug}
                organization={organization}
              />
            </MenuItem>
          ))}

          {!hideCreate && (
            <>
              {hasOtherEntries && <MenuSeparator />}

              <MenuItem
                onClick={() => {
                  setDropdownOpen(false);
                  setCreateOpen(true);
                }}
              >
                <PlusCircle
                  aria-hidden="true"
                  className="text-muted-foreground"
                />

                {organizationLocalization.createOrganization}
              </MenuItem>
            </>
          )}
        </MenuPopup>
      </Menu>

      <CreateOrganizationDialog
        hideSlug={hideSlug}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </>
  );
}
