"use client";

import type React from "react";
import { FieldError } from "#components/field";

export interface AuthFieldErrorProps {
  errors?: Array<string | { message?: string } | undefined | null>;
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * Domain-specific error component for auth forms.
 * Formats Better Auth / TanStack Form error objects and renders
 * via Coss UI's stock `FieldError` primitive without mutating core packages.
 */
export function AuthFieldError({
  errors,
  children,
  id,
  className,
}: AuthFieldErrorProps): React.ReactElement | null {
  const errorText = errors
    ?.map((e) => (typeof e === "string" ? e : e?.message))
    .filter(Boolean)
    .join(", ");

  const content = errorText || children;

  if (!content) return null;

  return (
    <FieldError id={id} match={true} className={className}>
      {content}
    </FieldError>
  );
}
