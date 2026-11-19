"use client";

import * as React from "react";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "theoui/components/select";
import { SparklesIcon } from "lucide-react";
import { cn } from "theoui/lib/utils";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", provider: "Anthropic" },
  { id: "gpt-4o", name: "GPT-4o (Omni)", provider: "OpenAI" },
  { id: "gemini-2-flash", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek" },
];

export function ModelSelect({
  value,
  onValueChange,
  className,
  size = "sm",
}: {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <Select
      items={AVAILABLE_MODELS.map((m) => ({ label: m.name, value: m.id }))}
      value={value}
      onValueChange={(val) => {
        if (typeof val === "string") onValueChange(val);
      }}
    >
      <SelectTrigger
        size={size}
        className={cn(
          "w-fit min-w-36 border-border/80 bg-background/50 text-xs shadow-none hover:bg-muted/50",
          className,
        )}
      >
        <SparklesIcon className="size-3.5 text-primary opacity-80" />
        <SelectValue placeholder="Select Model">
          {(val) => AVAILABLE_MODELS.find((m) => m.id === val)?.name ?? val}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup align="end" alignItemWithTrigger={false} sideOffset={6}>
        <SelectGroup>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-xs">
              <span className="font-medium">{model.name}</span>
              <span className="ms-1.5 text-[10px] text-muted-foreground uppercase">
                ({model.provider})
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectPopup>
    </Select>
  );
}
