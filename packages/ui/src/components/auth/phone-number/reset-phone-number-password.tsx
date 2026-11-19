"use client";

import {
  isPasswordCompromisedError,
  validateMatchingValue,
  validateStringLength,
} from "@better-auth-ui/core";
import type { PhoneNumberAuthClient } from "@better-auth-ui/core/plugins/phone-number";
import { useAuth, useAuthPlugin } from "@better-auth-ui/react";
import { useResetPhoneNumberPassword } from "@better-auth-ui/react/plugins/phone-number";
import { useSelector } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@theo/ui/components/button";
import { Field, FieldLabel } from "@theo/ui/components/field";
import { Input } from "@theo/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@theo/ui/components/input-group";
import { phoneNumberPlugin } from "@theo/ui/lib/auth/phone-number-plugin";
import {
  isAuthFormFieldInvalid,
  setAuthFormServerError,
  useAuthForm,
} from "../auth-form";
import { AuthFormContainer } from "../auth-layout";
import { OtpField } from "../otp-field";
import { PasswordStrengthMeter } from "../password-strength-meter";
import { useIsHydrated } from "../use-is-hydrated";
import { PHONE_NUMBER_RESET_STORAGE_KEY } from "./forgot-phone-number-password";

export type ResetPhoneNumberPasswordProps = {
  className?: string;
};

/** Reset a phone credential password with the code sent to the user. */
export function ResetPhoneNumberPassword({
  className,
}: ResetPhoneNumberPasswordProps) {
  const { authClient, basePaths, emailAndPassword, localization, navigate } =
    useAuth();
  const {
    localization: phoneLocalization,
    otpLength,
    viewPaths: phoneNumberViewPaths,
  } = useAuthPlugin(phoneNumberPlugin);
  const isHydrated = useIsHydrated();
  const initialPhoneNumber =
    (isHydrated && sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY)) ||
    "";
  const [hasStoredPhoneNumber, setHasStoredPhoneNumber] = useState(
    Boolean(initialPhoneNumber),
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutateAsync: resetPassword, isPending } = useResetPhoneNumberPassword(
    authClient as PhoneNumberAuthClient,
    {
      onError: (error) => {
        // The haveIBeenPwned plugin rejects on the password itself, so it
        // belongs against the field rather than in a toast.
        if (isPasswordCompromisedError(error)) {
          setAuthFormServerError(
            form,
            { fields: { password: localization.auth.passwordCompromised } },
            localization.auth.passwordCompromised,
          );
        }

        form.setFieldValue("code", "");
      },
      onSuccess: () => {
        sessionStorage.removeItem(PHONE_NUMBER_RESET_STORAGE_KEY);
        toast.success(localization.auth.passwordResetSuccess);
        navigate({
          to: `${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`,
        });
      },
    },
  );

  const validatePassword = (value: string) =>
    validateStringLength(value, {
      maxLength: emailAndPassword?.maxPasswordLength,
      maxLengthMessage: localization.auth.tooLong.replace(
        "{{max}}",
        String(emailAndPassword?.maxPasswordLength),
      ),
      minLength: emailAndPassword?.minPasswordLength,
      minLengthMessage: localization.auth.tooShort.replace(
        "{{min}}",
        String(emailAndPassword?.minPasswordLength),
      ),
      requiredMessage: localization.auth.fieldRequired,
    });

  const form = useAuthForm({
    defaultValues: {
      code: "",
      confirmPassword: "",
      password: "",
      phoneNumber: initialPhoneNumber,
    },
    onSubmit: async ({ value }) => {
      await resetPassword({
        phoneNumber: value.phoneNumber,
        otp: value.code,
        newPassword: value.password,
      });
    },
  });
  const phoneNumber = useSelector(
    form.store,
    (formState) => formState.values.phoneNumber,
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(PHONE_NUMBER_RESET_STORAGE_KEY) ?? "";
    form.setFieldValue("phoneNumber", stored);
    setHasStoredPhoneNumber(Boolean(stored));
  }, [form.setFieldValue]);

  return (
    <AuthFormContainer className={className}>
      <div className="flex flex-col">
        <h1
          className={`text-xl font-semibold tracking-tight ${hasStoredPhoneNumber ? "mb-1.5" : "mb-4"}`}
        >
          {phoneLocalization.resetPassword}
        </h1>
        {hasStoredPhoneNumber && (
          <p className="mb-4 text-sm text-muted-foreground">
            {phoneLocalization.codeSentTo.replace(
              "{{phoneNumber}}",
              phoneNumber,
            )}
          </p>
        )}
        <form.AppForm>
          <form.AuthFormRoot>
            <div className="flex flex-col gap-4">
              {!hasStoredPhoneNumber && (
                <form.AppField
                  name="phoneNumber"
                  validators={{
                    onChange: ({ value }) =>
                      value.trim()
                        ? undefined
                        : localization.auth.fieldRequired,
                  }}
                >
                  {(field) => (
                    <Field invalid={isAuthFormFieldInvalid(field.state.meta)}>
                      <FieldLabel htmlFor="passwordResetPhoneNumber">
                        {phoneLocalization.phoneNumber}
                      </FieldLabel>
                      <Input
                        id="passwordResetPhoneNumber"
                        name={field.name}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={field.state.value}
                        placeholder={phoneLocalization.phoneNumberPlaceholder}
                        required
                        disabled={isPending}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={
                          isAuthFormFieldInvalid(field.state.meta) || undefined
                        }
                      />
                      <field.AuthFormFieldError />
                    </Field>
                  )}
                </form.AppField>
              )}

              <form.AppField
                name="code"
                validators={{
                  onChange: ({ value }) =>
                    value.length === otpLength
                      ? undefined
                      : phoneLocalization.codeLengthMismatch.replace(
                          "{{length}}",
                          String(otpLength),
                        ),
                }}
              >
                {(field) => (
                  <OtpField
                    autoFocus={hasStoredPhoneNumber}
                    disabled={isPending}
                    label={phoneLocalization.phoneCode}
                    length={otpLength}
                    name="otp"
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
                validators={{
                  onChange: ({ value }) => validatePassword(value),
                }}
              >
                {(field) => (
                  <Field invalid={isAuthFormFieldInvalid(field.state.meta)}>
                    <FieldLabel htmlFor="phoneNumberNewPassword">
                      {localization.auth.newPassword}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="phoneNumberNewPassword"
                        name={field.name}
                        type={isPasswordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        value={field.state.value}
                        placeholder={localization.auth.newPasswordPlaceholder}
                        required
                        minLength={emailAndPassword?.minPasswordLength}
                        maxLength={emailAndPassword?.maxPasswordLength}
                        disabled={isPending}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          field.handleChange(event.target.value);
                        }}
                        aria-invalid={
                          isAuthFormFieldInvalid(field.state.meta) || undefined
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={
                            isPasswordVisible
                              ? localization.auth.hidePassword
                              : localization.auth.showPassword
                          }
                          onClick={() =>
                            setIsPasswordVisible((visible) => !visible)
                          }
                        >
                          {isPasswordVisible ? <EyeOff /> : <Eye />}
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                    <field.AuthFormFieldError />

                    <PasswordStrengthMeter password={field.state.value} />
                  </Field>
                )}
              </form.AppField>

              {emailAndPassword?.confirmPassword && (
                <form.AppField
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ value, fieldApi }) =>
                      validateMatchingValue(
                        value,
                        fieldApi.form.getFieldValue("password"),
                        localization.auth.passwordsDoNotMatch,
                      ),
                  }}
                >
                  {(field) => (
                    <Field invalid={isAuthFormFieldInvalid(field.state.meta)}>
                      <FieldLabel htmlFor="phoneNumberConfirmPassword">
                        {localization.auth.confirmPassword}
                      </FieldLabel>
                      <Input
                        id="phoneNumberConfirmPassword"
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        placeholder={
                          localization.auth.confirmPasswordPlaceholder
                        }
                        required
                        minLength={emailAndPassword?.minPasswordLength}
                        maxLength={emailAndPassword?.maxPasswordLength}
                        disabled={isPending}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={
                          isAuthFormFieldInvalid(field.state.meta) || undefined
                        }
                      />

                      <field.AuthFormFieldError />
                    </Field>
                  )}
                </form.AppField>
              )}

              <form.AuthFormSubmitButton disabled={isPending}>
                {phoneLocalization.resetPassword}
              </form.AuthFormSubmitButton>
              <form.AuthFormServerError />
            </div>
          </form.AuthFormRoot>
        </form.AppForm>
      </div>
    </AuthFormContainer>
  );
}
