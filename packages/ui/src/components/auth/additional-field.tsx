"use client";

import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  getFormFieldErrors,
  resolveInputType,
} from "@better-auth-ui/core";
import { useAuth, useCopyToClipboard } from "@better-auth-ui/react";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronDownIcon, Copy } from "lucide-react";
import { type ComponentType, useRef, useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@theo/ui/button";
import { Calendar } from "@theo/ui/calendar";
import { Checkbox } from "@theo/ui/checkbox";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@theo/ui/combobox";
import { Field, FieldLabel } from "@theo/ui/field";
import { AuthFieldError } from "@theo/ui/auth/auth-field-error";
import { Input } from "@theo/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@theo/ui/input-group";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@theo/ui/popover";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@theo/ui/select";
import { Slider } from "@theo/ui/slider";
import { Switch } from "@theo/ui/switch";
import { Textarea } from "@theo/ui/textarea";
import { cn } from "@theo/ui/utils";

export type AdditionalFieldProps = {
  name: string;
  field: AdditionalFieldConfig;
  value: AdditionalFieldFormValue;
  onBlur: () => void;
  onChange: (value: AdditionalFieldFormValue) => void;
  isInvalid?: boolean;
  errors?: unknown[];
  isPending?: boolean;
  /** Complete suffix appended to labels for fields that are not required. */
  optionalLabel?: string;
};

function valueToString(value: AdditionalFieldFormValue) {
  if (value == null) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

/** Convert a `defaultValue` into a `Date` for the calendar. */
function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

/** Format a Date as `HH:mm:ss` for an `<input type="time">`. */
function formatTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Icon-only copy button used as an `InputGroupAddon`. `getValue` is invoked
 * lazily on click so the button copies the input's *live* value rather than a
 * stale snapshot — important when paired with editable inputs.
 */
function CopyButton({
  getValue,
  isDisabled,
}: {
  getValue: () => string | undefined;
  isDisabled?: boolean;
}) {
  const { localization } = useAuth();
  const { copied, copy } = useCopyToClipboard({
    onError: (error) => {
      console.error("[Better Auth UI] Copy failed", error);
      toast.error(localization.errors.copyFailed);
    },
  });

  async function handleCopy() {
    const value = getValue();
    if (!value) return;

    await copy(value);
  }

  return (
    <InputGroupAddon align="inline-end">
      <Button
        aria-label={
          copied
            ? localization.settings.copiedToClipboard
            : localization.settings.copyToClipboard
        }
        disabled={isDisabled}
        onClick={handleCopy}
        size="icon"
        title={
          copied
            ? localization.settings.copiedToClipboard
            : localization.settings.copyToClipboard
        }
        type="button"
        variant="ghost"
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
    </InputGroupAddon>
  );
}

/** Renders a single additional user field via shadcn primitives. */
export function AdditionalField({
  name,
  field: configuredField,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
  optionalLabel,
}: AdditionalFieldProps) {
  const field =
    optionalLabel && !configuredField.required
      ? {
          ...configuredField,
          label: (
            <>
              {configuredField.label}
              {optionalLabel}
            </>
          ),
        }
      : configuredField;
  const inputType = resolveInputType(field);
  const fieldErrors = getFormFieldErrors(errors ?? []);

  if (field.render) {
    const FieldRenderer = field.render as ComponentType<AdditionalFieldProps>;
    return (
      <FieldRenderer
        name={name}
        field={field}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        errors={errors}
        isPending={isPending}
        optionalLabel={optionalLabel}
      />
    );
  }

  if (inputType === "hidden") {
    return (
      <input type="hidden" name={name} value={valueToString(value)} readOnly />
    );
  }

  if (inputType === "textarea") {
    return (
      <Field invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <Textarea
          id={name}
          name={name}
          value={valueToString(value)}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value || null)}
          placeholder={field.placeholder}
          aria-required={field.required || undefined}
          readOnly={field.readOnly}
          disabled={isPending}
          aria-invalid={isInvalid || undefined}
        />

        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  if (inputType === "number") {
    const maxFractionDigits = field.formatOptions?.maximumFractionDigits;

    return (
      <Field invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <Input
          id={name}
          name={name}
          type="number"
          inputMode={maxFractionDigits ? "decimal" : "numeric"}
          min={field.min}
          max={field.max}
          step={
            field.step ??
            (maxFractionDigits ? 1 / 10 ** maxFractionDigits : undefined)
          }
          value={typeof value === "number" ? value : ""}
          onBlur={onBlur}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? null : event.target.valueAsNumber,
            )
          }
          placeholder={field.placeholder}
          aria-required={field.required || undefined}
          readOnly={field.readOnly}
          disabled={isPending}
          aria-invalid={isInvalid || undefined}
        />

        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  if (inputType === "slider") {
    return (
      <SliderField
        name={name}
        field={field}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        errors={errors}
        isPending={isPending}
      />
    );
  }

  if (inputType === "switch") {
    return (
      <Field className="flex-row items-center gap-2" invalid={isInvalid}>
        <Switch
          id={name}
          name={name}
          checked={value === true}
          onBlur={onBlur}
          onCheckedChange={onChange}
          disabled={isPending || field.readOnly}
          aria-required={field.required || undefined}
          aria-invalid={isInvalid || undefined}
        />

        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  if (inputType === "checkbox") {
    return (
      <Field className="flex-row items-center gap-2" invalid={isInvalid}>
        <Checkbox
          id={name}
          name={name}
          checked={value === true}
          onBlur={onBlur}
          onCheckedChange={(checked) => onChange(checked === true)}
          aria-required={field.required || undefined}
          disabled={isPending || field.readOnly}
          aria-invalid={isInvalid || undefined}
        />

        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  if (inputType === "select") {
    return (
      <Field invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <Select
          items={field.options ?? []}
          name={name}
          value={valueToString(value) || undefined}
          onValueChange={(nextValue) => onChange(nextValue)}
          disabled={isPending || field.readOnly}
        >
          <SelectTrigger
            id={name}
            className="w-full"
            onBlur={onBlur}
            aria-required={field.required || undefined}
            aria-invalid={isInvalid || undefined}
          >
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>

          <SelectPopup>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  if (inputType === "combobox") {
    const selectedOption = field.options?.find(
      (option) => option.value === valueToString(value),
    );

    return (
      <Field invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <Combobox
          items={field.options ?? []}
          name={name}
          value={selectedOption ?? null}
          onValueChange={(option) => onChange(option?.value ?? null)}
          disabled={isPending || field.readOnly}
        >
          <ComboboxInput
            placeholder={field.placeholder}
            id={name}
            onBlur={onBlur}
            aria-required={field.required || undefined}
            aria-invalid={isInvalid || undefined}
          />

          <ComboboxPopup>
            <ComboboxEmpty>No items found.</ComboboxEmpty>

            <ComboboxList>
              {field.options?.map((option) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>

        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  if (inputType === "date" || inputType === "datetime") {
    return (
      <DateInput
        name={name}
        field={field}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        isInvalid={isInvalid}
        errors={errors}
        isPending={isPending}
      />
    );
  }

  return (
    <InputField
      name={name}
      field={field}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      isInvalid={isInvalid}
      errors={errors}
      isPending={isPending}
    />
  );
}

function InputField({
  name,
  field,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
}: AdditionalFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldErrors = getFormFieldErrors(errors ?? []);

  const hasPrefix = field.prefix != null;
  const hasSuffix = field.suffix != null || field.copyable;

  const isNumeric = field.type === "number";
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
  const nativeInputType = isNumeric ? "number" : undefined;
  const nativeInputMode = isNumeric
    ? maxFractionDigits
      ? "decimal"
      : "numeric"
    : undefined;
  const nativeStep = maxFractionDigits
    ? 1 / 10 ** maxFractionDigits
    : undefined;

  if (hasPrefix || hasSuffix) {
    return (
      <Field invalid={isInvalid}>
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

        <InputGroup>
          {hasPrefix && (
            <InputGroupAddon align="inline-start">
              {field.prefix}
            </InputGroupAddon>
          )}

          <InputGroupInput
            ref={inputRef}
            id={name}
            name={name}
            type={nativeInputType}
            inputMode={nativeInputMode}
            step={nativeStep}
            value={valueToString(value)}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value || null)}
            placeholder={field.placeholder}
            aria-required={field.required || undefined}
            readOnly={field.readOnly}
            disabled={isPending}
            aria-invalid={isInvalid || undefined}
          />

          {field.copyable ? (
            <InputGroupAddon align="inline-end">
              <CopyButton
                getValue={() => inputRef.current?.value}
                isDisabled={isPending}
              />
            </InputGroupAddon>
          ) : (
            field.suffix != null && (
              <InputGroupAddon align="inline-end">
                {field.suffix}
              </InputGroupAddon>
            )
          )}
        </InputGroup>

        <AuthFieldError errors={fieldErrors} />
      </Field>
    );
  }

  return (
    <Field invalid={isInvalid}>
      <FieldLabel htmlFor={name}>{field.label}</FieldLabel>

      <Input
        id={name}
        name={name}
        type={nativeInputType}
        inputMode={nativeInputMode}
        step={nativeStep}
        value={valueToString(value)}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value || null)}
        placeholder={field.placeholder}
        aria-required={field.required || undefined}
        readOnly={field.readOnly}
        disabled={isPending}
        aria-invalid={isInvalid || undefined}
      />

      <AuthFieldError errors={fieldErrors} />
    </Field>
  );
}

/**
 * Slider field.
 */
function SliderField({
  name,
  field,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
}: AdditionalFieldProps) {
  const maxFractionDigits = field.formatOptions?.maximumFractionDigits;
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step =
    field.step ?? (maxFractionDigits ? 1 / 10 ** maxFractionDigits : 1);
  const numericValue = typeof value === "number" ? value : min;
  const fieldErrors = getFormFieldErrors(errors ?? []);

  const formatter = new Intl.NumberFormat(undefined, field.formatOptions);

  return (
    <Field invalid={isInvalid}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={name}>{field.label}</FieldLabel>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatter.format(numericValue)}
        </span>
      </div>

      <Slider
        id={name}
        name={name}
        value={[numericValue]}
        onBlur={onBlur}
        onValueChange={(nextValue) =>
          onChange((Array.isArray(nextValue) ? nextValue[0] : nextValue) ?? min)
        }
        min={min}
        max={max}
        step={step}
        disabled={isPending || field.readOnly}
        aria-required={field.required || undefined}
        aria-invalid={isInvalid || undefined}
      />

      <AuthFieldError errors={fieldErrors} />
    </Field>
  );
}

/**
 * Date / datetime input. Composes `Popover` + `Calendar` for the date and
 * (optionally) `<input type="time">` for the time. Submits the combined ISO
 * value via a hidden `<input>` so it shows up in `FormData`.
 */
function DateInput({
  name,
  field,
  value,
  onBlur,
  onChange,
  isInvalid,
  errors,
  isPending,
}: AdditionalFieldProps) {
  const { localization } = useAuth();
  const inputType = resolveInputType(field);
  const isDateTime = inputType === "datetime";
  const fieldErrors = getFormFieldErrors(errors ?? []);

  const date = toDate(value);
  const [time, setTime] = useState<string>(
    isDateTime && date ? formatTime(date) : "",
  );
  const [open, setOpen] = useState(false);

  // Compose the hidden form value: ISO date for "date", ISO datetime for
  // "datetime" (date + time).
  return (
    <Field invalid={isInvalid}>
      <FieldLabel htmlFor={`${name}-date`}>{field.label}</FieldLabel>

      <div className="relative flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            id={`${name}-date`}
            data-empty={!date}
            aria-invalid={isInvalid || undefined}
            aria-required={field.required}
            onBlur={onBlur}
            disabled={isPending || field.readOnly}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 justify-between font-normal",
              "data-[empty=true]:text-muted-foreground",
            )}
          >
            {date ? format(date, "PPP") : <span>{field.placeholder}</span>}

            {isDateTime ? <ChevronDownIcon /> : <CalendarIcon />}
          </PopoverTrigger>

          <PopoverPopup className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              captionLayout="dropdown"
              onSelect={(value) => {
                if (!value) {
                  onChange(null);
                } else {
                  const nextValue = new Date(value);
                  if (isDateTime && time.trim()) {
                    const [hours = "0", minutes = "0", seconds = "0"] =
                      time.split(":");
                    nextValue.setHours(
                      Number(hours),
                      Number(minutes),
                      Number(seconds),
                      0,
                    );
                  } else {
                    nextValue.setHours(0, 0, 0, 0);
                  }
                  onChange(nextValue);
                }
                if (!isDateTime) setOpen(false);
              }}
            />
          </PopoverPopup>
        </Popover>

        {isDateTime && (
          <Field className="w-32">
            <FieldLabel htmlFor={`${name}-time`} className="sr-only">
              {localization.settings.time}
            </FieldLabel>

            <Input
              type="time"
              id={`${name}-time`}
              step="1"
              value={time}
              onChange={(event) => {
                const nextTime = event.target.value;
                setTime(nextTime);
                if (!date) return;
                const nextValue = new Date(date);
                const [hours = "0", minutes = "0", seconds = "0"] =
                  nextTime.split(":");
                nextValue.setHours(
                  Number(hours),
                  Number(minutes),
                  Number(seconds),
                  0,
                );
                onChange(nextValue);
              }}
              disabled={isPending || field.readOnly}
              className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </Field>
        )}
      </div>

      <AuthFieldError errors={fieldErrors} />
    </Field>
  );
}
