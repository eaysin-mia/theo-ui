"use client";

import type {
  ListedUserTeam,
  OrganizationTeamsAuthClient,
} from "@better-auth-ui/core/plugins/organization";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import {
  useListUserTeams,
  useSetActiveTeam,
} from "@better-auth-ui/react/plugins/organization";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { type ReactElement, useState } from "react";
import { buttonVariants } from "@theo/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@theo/ui/menu";
import { Skeleton } from "@theo/ui/skeleton";
import { organizationPlugin } from "@theo/ui/auth/plugins/organization-plugin";
import { cn } from "@theo/ui/utils";

export type TeamSwitcherProps = {
  organizationId: string;
  teamId?: string | null;
  onTeamChange?: (team: ListedUserTeam | null) => void;
  syncSession?: boolean;
  allowClear?: boolean;
  className?: string;
  align?: "center" | "end" | "start";
  trigger?: ReactElement;
};

/**
 * Renders a team switcher menu using Coss UI Menu primitives.
 */
export function TeamSwitcher({
  align,
  allowClear = true,
  className,
  onTeamChange,
  organizationId,
  syncSession = false,
  teamId,
  trigger,
}: TeamSwitcherProps) {
  const { authClient } = useAuth<OrganizationTeamsAuthClient>();
  const { localization } = useAuthPlugin(organizationPlugin);
  const [open, setOpen] = useState(false);
  const teams = useListUserTeams(authClient, {
    query: { organizationId },
  });
  const setActiveTeam = useSetActiveTeam(authClient);
  const selectedTeam = teams.data?.find((team) => team.id === teamId);

  function selectTeam(team: ListedUserTeam | null) {
    onTeamChange?.(team);
    setOpen(false);

    if (syncSession) {
      setActiveTeam.mutate({ organizationId, teamId: team?.id ?? null });
    }
  }

  return (
    <Menu onOpenChange={setOpen} open={open}>
      {trigger ? (
        <MenuTrigger render={trigger} />
      ) : (
        <MenuTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "justify-between gap-3",
            className,
          )}
          disabled={teams.isPending || setActiveTeam.isPending}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Users
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            {teams.isPending ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="truncate">
                {selectedTeam?.name ?? localization.selectTeam}
              </span>
            )}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </MenuTrigger>
      )}
      <MenuPopup align={align} className="min-w-56">
        {allowClear && (
          <MenuItem onClick={() => selectTeam(null)}>
            <span className="min-w-0 flex-1 truncate">
              {localization.allTeams}
            </span>
            {!teamId && <Check aria-hidden="true" className="size-4" />}
          </MenuItem>
        )}
        {teams.data?.map((team) => (
          <MenuItem key={team.id} onClick={() => selectTeam(team)}>
            <span className="min-w-0 flex-1 truncate">{team.name}</span>
            {team.id === teamId && (
              <Check aria-hidden="true" className="size-4" />
            )}
          </MenuItem>
        ))}
        {!teams.isPending && teams.data?.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {localization.noTeams}
          </div>
        )}
      </MenuPopup>
    </Menu>
  );
}
