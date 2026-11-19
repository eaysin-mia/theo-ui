"use client";

import {
  ThemePreviewDark,
  ThemePreviewLight,
  ThemePreviewSystem,
  useAuthPlugin,
} from "@better-auth-ui/react";
import { useEffect, useState } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@theo/ui/components/card";
import { Field, FieldItem, FieldLabel } from "@theo/ui/components/field";
import { Fieldset, FieldsetLegend } from "@theo/ui/components/fieldset";
import { Radio, RadioGroup } from "@theo/ui/components/radio-group";
import { themePlugin } from "@theo/ui/lib/auth/theme-plugin";
import { cn } from "@theo/ui/lib/utils";

export type AppearanceProps = {
  className?: string;
};

/**
 * Renders a theme selector card with visual theme previews following Coss UI particle p-radio-group-6.
 */
export function Appearance({ className }: AppearanceProps) {
  const { useTheme, localization } = useAuthPlugin(themePlugin);
  const { theme, setTheme, themes = [] } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const items = [
    {
      value: "system" as const,
      label: localization.system,
      preview: <ThemePreviewSystem className="size-full" />,
    },
    {
      value: "light" as const,
      label: localization.light,
      preview: <ThemePreviewLight className="size-full" />,
    },
    {
      value: "dark" as const,
      label: localization.dark,
      preview: <ThemePreviewDark className="size-full" />,
    },
  ].filter((item) => themes.includes(item.value));

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{localization.appearance}</CardTitle>
        <CardDescription>
          Customize how the application looks on your device.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <Field
          className="gap-4"
          name="theme"
          render={(props) => <Fieldset {...props} />}
        >
          <FieldsetLegend className="text-sm font-medium">
            {localization.theme}
          </FieldsetLegend>

          <RadioGroup
            className="flex flex-row flex-wrap gap-4"
            value={isMounted ? theme : ""}
            onValueChange={setTheme}
            disabled={!isMounted || !theme}
          >
            {items.map((item) => (
              <FieldItem key={item.value}>
                <FieldLabel className="cursor-pointer flex-col items-start gap-2">
                  <Radio className="peer sr-only absolute" value={item.value} />
                  <span className="relative block h-17.5 w-22 overflow-hidden rounded-lg shadow-xs transition-shadow not-peer-data-checked:opacity-80 peer-data-checked:ring-2 peer-data-checked:ring-primary/48 peer-data-checked:ring-offset-1 peer-data-checked:ring-offset-background peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-64">
                    {item.preview}
                  </span>
                  <span className="text-xs font-medium not-peer-data-checked:text-muted-foreground/72">
                    {item.label}
                  </span>
                </FieldLabel>
              </FieldItem>
            ))}
          </RadioGroup>
        </Field>
      </CardPanel>
    </Card>
  );
}
