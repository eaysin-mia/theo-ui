"use client";

import { getFormFieldErrors } from "@better-auth-ui/core";
import type { UsernameAuthClient } from "@better-auth-ui/core/plugins/username";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useIsUsernameAvailable } from "@better-auth-ui/react/plugins/username";
import { useDebouncer } from "@tanstack/react-pacer";
import { Check, X } from "lucide-react";
import { useState } from "react";
import type { AdditionalFieldProps } from "theoui/components/auth/additional-field";
import { AuthFieldError } from "theoui/components/auth/auth-field-error";
import { Field, FieldLabel } from "theoui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "theoui/components/input-group";
import { Spinner } from "theoui/components/spinner";
import { usernamePlugin } from "theoui/lib/auth/username-plugin";

/**
 * Renderer for the `username` additional field. Owns availability checking,
 * length limits, and visual indicators. `isInvalid` reflects only browser
 * validation (minLength, required, etc.) — availability feedback is shown
 * via the icon and `aria-label` without affecting the field's invalid state.
 */
export function UsernameField({
  name,
  field,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
}: AdditionalFieldProps) {
  const { authClient, localization: authLocalization } =
    useAuth<UsernameAuthClient>();
  const {
    localization,
    minUsernameLength,
    maxUsernameLength,
    isUsernameAvailable: checkAvailability,
    usernamePrefix,
  } = useAuthPlugin(usernamePlugin);

  const currentUsername = String(field.defaultValue ?? "");
  const username = typeof value === "string" ? value : "";
  const [nativeError, setNativeError] = useState<string>();
  const fieldErrors = getFormFieldErrors(errors ?? []);

  const {
    mutate: requestAvailability,
    data: availability,
    error: availabilityError,
    reset: resetAvailability,
  } = useIsUsernameAvailable(authClient, {
    onError: () => {},
  });

  const debouncer = useDebouncer(
    (next: string) => {
      const trimmed = next.trim();
      if (!trimmed || trimmed === currentUsername) {
        resetAvailability();
        return;
      }

      requestAvailability({ username: trimmed });
    },
    { wait: 500 },
  );

  function handleChange(next: string) {
    onChange(next || null);
    setNativeError(undefined);
    resetAvailability();

    if (checkAvailability) {
      debouncer.maybeExecute(next);
    }
  }

  const isCheckingAvailability =
    !!checkAvailability &&
    !!username.trim() &&
    username.trim() !== currentUsername;

  return (
    <Field invalid={isInvalid || !!nativeError}>
      <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

      <InputGroup>
        {usernamePrefix && (
          <InputGroupAddon align="inline-start">
            {usernamePrefix}
          </InputGroupAddon>
        )}

        <InputGroupInput
          id={name}
          name={name}
          type="text"
          autoComplete="username"
          minLength={minUsernameLength}
          maxLength={maxUsernameLength}
          disabled={isPending}
          aria-required={field.required || undefined}
          readOnly={field.readOnly}
          value={username}
          onBlur={onBlur}
          onChange={(e) => handleChange(e.target.value)}
          aria-invalid={isInvalid || !!nativeError || undefined}
          placeholder={field.placeholder}
        />

        {isCheckingAvailability && (
          <InputGroupAddon
            align="inline-end"
            aria-label={
              availability?.available
                ? localization.usernameAvailable
                : availability?.available === false
                  ? localization.usernameTaken
                  : undefined
            }
          >
            {availability?.available ? (
              <Check className="size-4 text-foreground" />
            ) : availabilityError || availability?.available === false ? (
              <X className="size-4 text-destructive" />
            ) : (
              <Spinner />
            )}
          </InputGroupAddon>
        )}
      </InputGroup>

      <AuthFieldError errors={fieldErrors}>{nativeError}</AuthFieldError>
    </Field>
  );
}
