"use client";

import { useAuthPlugin } from "@better-auth-ui/react";
import { Monitor, Moon, PaletteIcon, Sun } from "lucide-react";

import {
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
} from "@theo/ui/menu";
import { themePlugin } from "@theo/ui/auth/plugins/theme-plugin";

/**
 * Theme toggle dropdown item used inside `UserButton`.
 *
 * Built with Coss UI MenuSub, MenuSubTrigger, and MenuRadioGroup primitives (p-menu-4, p-menu-7).
 */
export function ThemeToggleItem() {
  const { localization, useTheme } = useAuthPlugin(themePlugin);
  const { setTheme, theme, themes = ["light", "dark", "system"] } = useTheme();

  return (
    <MenuSub>
      <MenuSubTrigger>
        <PaletteIcon aria-hidden="true" />
        <span>{localization.theme}</span>
      </MenuSubTrigger>

      <MenuSubPopup>
        <MenuRadioGroup onValueChange={setTheme} value={theme}>
          {themes.includes("light") && (
            <MenuRadioItem value="light">
              <span className="flex items-center gap-2">
                <Sun aria-hidden="true" />
                {localization.light}
              </span>
            </MenuRadioItem>
          )}

          {themes.includes("dark") && (
            <MenuRadioItem value="dark">
              <span className="flex items-center gap-2">
                <Moon aria-hidden="true" />
                {localization.dark}
              </span>
            </MenuRadioItem>
          )}

          {themes.includes("system") && (
            <MenuRadioItem value="system">
              <span className="flex items-center gap-2">
                <Monitor aria-hidden="true" />
                {localization.system}
              </span>
            </MenuRadioItem>
          )}
        </MenuRadioGroup>
      </MenuSubPopup>
    </MenuSub>
  );
}
