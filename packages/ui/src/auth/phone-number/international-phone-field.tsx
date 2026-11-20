"use client";

import {
  createPhoneNumberValue,
  getPhoneNumberCountries,
  type PhoneNumberAdapter,
  type PhoneNumberCountryCode,
  type PhoneNumberValue,
} from "@better-auth-ui/core/plugins/phone-number";
import { useId, useMemo } from "react";

import { Field, FieldError, FieldLabel } from "#components/field";
import { Group, GroupSeparator } from "#components/group";
import { Input } from "#components/input";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "#components/select";

type InternationalPhoneFieldProps = {
  adapter: PhoneNumberAdapter;
  countryLabel: string;
  countryCodes?: readonly PhoneNumberCountryCode[];
  disabled?: boolean;
  error?: string;
  locale?: string;
  name?: string;
  onBlur?: () => void;
  phoneLabel: string;
  placeholder: string;
  value: PhoneNumberValue;
  onChange: (value: PhoneNumberValue) => void;
};

export function InternationalPhoneField({
  adapter,
  countryLabel,
  countryCodes,
  disabled,
  error,
  locale,
  name = "phoneNumber",
  onBlur,
  phoneLabel,
  placeholder,
  value,
  onChange,
}: InternationalPhoneFieldProps) {
  const id = useId();
  const countries = useMemo(
    () => getPhoneNumberCountries(locale, countryCodes),
    [countryCodes, locale],
  );
  const countryItems = countries.map((country) => ({
    label: `${country.flag} ${country.callingCode}`,
    value: country.code,
  }));

  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel htmlFor={`${id}-number`}>{phoneLabel}</FieldLabel>
      <Group className="w-full">
        <Select
          items={countryItems}
          disabled={disabled}
          value={value.country}
          onValueChange={(country) => {
            if (!country) return;
            const nextCountry = country as PhoneNumberCountryCode;
            const input = value.display.startsWith("+") ? "" : value.display;
            onChange(createPhoneNumberValue(input, nextCountry, adapter));
          }}
        >
          <SelectTrigger
            id={`${id}-country`}
            aria-label={countryLabel}
            className="min-w-none w-fit ps-3 pe-2"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectPopup className="max-h-60">
            <SelectGroup>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true">{country.flag}</span>
                      <span>{country.label}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {country.callingCode}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectPopup>
        </Select>
        <GroupSeparator />
        <Input
          id={`${id}-number`}
          aria-invalid={Boolean(error) || undefined}
          autoComplete="tel-national"
          disabled={disabled}
          inputMode="tel"
          name={name}
          onBlur={onBlur}
          placeholder={placeholder}
          type="tel"
          value={value.display}
          className="flex-1"
          onChange={(event) =>
            onChange(
              createPhoneNumberValue(
                event.target.value,
                value.country,
                adapter,
              ),
            )
          }
        />
      </Group>
      {error ? <FieldError match={true}>{error}</FieldError> : null}
    </Field>
  );
}
