"use client";

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization";
import { Settings2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuPopup,
  MenuTrigger,
} from "@workspace/ui/components/menu";

export type OrganizationTableViewColumn = {
  id: string;
  label: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
};

/**
 * Column visibility toggle menu built with Coss UI Menu primitives.
 */
export function OrganizationTableViewOptions({
  columns,
  disabled,
  localization,
}: {
  columns: OrganizationTableViewColumn[];
  disabled?: boolean;
  localization: OrganizationLocalization;
}) {
  return (
    <Menu>
      <MenuTrigger
        render={<Button size="sm" variant="outline" />}
        disabled={disabled}
      >
        <Settings2 aria-hidden="true" />
        {localization.columns}
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuGroup>
          {columns.map((column) => (
            <MenuCheckboxItem
              checked={column.visible}
              key={column.id}
              onCheckedChange={(checked) =>
                column.onVisibleChange(checked === true)
              }
            >
              {column.label}
            </MenuCheckboxItem>
          ))}
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
