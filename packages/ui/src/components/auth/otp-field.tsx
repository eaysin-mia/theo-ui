"use client";

import { useId } from "react";
import { Field, FieldError, FieldLabel } from "@theo/ui/field";
import { OTPField, OTPFieldInput } from "@theo/ui/otp-field";
import { cn } from "@theo/ui/utils";

export type OtpFieldProps = {
  /** Visible label rendered above the slots. */
  label: string;
  /** Number of slots — keep in sync with the server's code length. */
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  className?: string;
  errorMessage?: string;
  disabled?: boolean;
  name?: string;
};

/** Strip everything the numeric slots can't hold — pasted codes often carry spaces or dashes. */
function normalizeCode(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Labelled one-time-code input using Coss UI OTPField primitive.
 */
export function OtpField({
  autoFocus,
  className,
  disabled,
  errorMessage,
  label,
  length,
  name,
  onChange,
  onComplete,
  value,
}: OtpFieldProps) {
  const inputId = useId();

  return (
    <Field className={cn(className)} invalid={!!errorMessage}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

      <OTPField
        aria-invalid={!!errorMessage || undefined}
        aria-label={label}
        autoFocus={autoFocus}
        className="w-full justify-center"
        disabled={disabled}
        id={inputId}
        length={length}
        name={name}
        onValueChange={(next) => {
          const normalized = normalizeCode(next);
          onChange(normalized);
          if (normalized.length === length) {
            onComplete?.(normalized);
          }
        }}
        value={value}
      >
        {Array.from({ length }, (_, slotIndex) => (
          <OTPFieldInput
            aria-label={
              slotIndex > 0
                ? `Character ${slotIndex + 1} of ${length}`
                : undefined
            }
            key={`otp-slot-${String(slotIndex + 1)}`}
          />
        ))}
      </OTPField>

      {errorMessage ? (
        <FieldError match={true}>{errorMessage}</FieldError>
      ) : null}
    </Field>
  );
}
