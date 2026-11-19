"use client";

import { getFormFieldErrorMessage } from "@better-auth-ui/core";
import {
  createPhoneNumberValue,
  type PhoneNumberAuthClient,
} from "@better-auth-ui/core/plugins/phone-number";
import { useAuth, useAuthPlugin, useFetchOptions } from "@better-auth-ui/react";
import { useRequestPhoneNumberPasswordReset } from "@better-auth-ui/react/plugins/phone-number";

import { phoneNumberPlugin } from "theo-ui/lib/auth/phone-number-plugin";
import { isAuthFormFieldInvalid, useAuthForm } from "../auth-form";
import { AuthFormContainer } from "../auth-layout";
import { InternationalPhoneField } from "./international-phone-field";

export const PHONE_NUMBER_RESET_STORAGE_KEY =
  "better-auth-ui.phone-number-reset";

export type ForgotPhoneNumberPasswordProps = {
  className?: string;
};

/** Request the verification code used to reset a phone credential password. */
export function ForgotPhoneNumberPassword({
  className,
}: ForgotPhoneNumberPasswordProps) {
  const { authClient, basePaths, localization, navigate, plugins, Link } =
    useAuth();
  const {
    adapter,
    countries,
    defaultCountry,
    locale,
    localization: phoneLocalization,
    viewPaths: phoneNumberViewPaths,
  } = useAuthPlugin(phoneNumberPlugin);
  const { fetchOptions, resetFetchOptions } = useFetchOptions();
  const { mutateAsync: requestReset, isPending } =
    useRequestPhoneNumberPasswordReset(authClient as PhoneNumberAuthClient, {
      onError: () => resetFetchOptions(),
      onSuccess: (_data, { phoneNumber }) => {
        sessionStorage.setItem(PHONE_NUMBER_RESET_STORAGE_KEY, phoneNumber);
        navigate({
          to: `${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumberResetPassword}`,
        });
      },
    });
  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent,
  )?.captchaComponent;

  const form = useAuthForm({
    defaultValues: {
      phoneNumber: createPhoneNumberValue("", defaultCountry, adapter),
    },
    onSubmit: async ({ value }) => {
      if (!value.phoneNumber.e164) return;
      await requestReset({ phoneNumber: value.phoneNumber.e164, fetchOptions });
    },
  });

  return (
    <AuthFormContainer className={className}>
      <div>
        <h1 className="mb-4 text-xl font-semibold tracking-tight">
          {phoneLocalization.forgotPassword}
        </h1>
        <form.AppForm>
          <form.AuthFormRoot>
            <div className="flex flex-col gap-4">
              <form.AppField
                name="phoneNumber"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.display.trim()) return undefined;
                    return value.e164
                      ? undefined
                      : phoneLocalization.invalidPhoneNumber;
                  },
                  onBlur: ({ value }) =>
                    value.e164
                      ? undefined
                      : phoneLocalization.invalidPhoneNumber,
                  onSubmit: ({ value }) =>
                    value.e164
                      ? undefined
                      : phoneLocalization.invalidPhoneNumber,
                }}
              >
                {(field) => {
                  const isInvalid = isAuthFormFieldInvalid(field.state.meta);
                  return (
                    <InternationalPhoneField
                      adapter={adapter}
                      countryCodes={countries}
                      countryLabel={phoneLocalization.country}
                      disabled={isPending}
                      error={
                        isInvalid
                          ? getFormFieldErrorMessage(field.state.meta.errors)
                          : undefined
                      }
                      locale={locale}
                      phoneLabel={phoneLocalization.phoneNumber}
                      placeholder={phoneLocalization.phoneNumberPlaceholder}
                      value={field.state.value}
                      onChange={field.handleChange}
                      onBlur={field.handleBlur}
                    />
                  );
                }}
              </form.AppField>
              {Captcha && <div className="flex justify-center">{Captcha}</div>}
              <form.AuthFormSubmitButton
                isPending={isPending}
                disabled={isPending}
              >
                {phoneLocalization.sendCode}
              </form.AuthFormSubmitButton>
            </div>
          </form.AuthFormRoot>
        </form.AppForm>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {localization.auth.rememberYourPassword}{" "}
          <Link
            href={`${basePaths.auth}/${phoneNumberViewPaths.auth.phoneNumber}`}
            className="underline underline-offset-4"
          >
            {localization.auth.signIn}
          </Link>
        </p>
      </div>
    </AuthFormContainer>
  );
}
