"use client";

import type { SsoAuthClient } from "@better-auth-ui/core/plugins/sso";
import {
  useAuth,
  useAuthPlugin,
  useCopyToClipboard,
} from "@better-auth-ui/react";
import {
  useRequestSsoDomainVerification,
  useVerifySsoDomain,
} from "@better-auth-ui/react/plugins/sso";
import type { BetterFetchError } from "better-auth/client";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CopyIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "theoui/components/button";
import {
  Card,
  CardPanel,
  CardDescription,
  CardHeader,
  CardTitle,
} from "theoui/components/card";
import { Alert, AlertDescription } from "theoui/components/alert";
import { Field, FieldLabel } from "theoui/components/field";
import { Input } from "theoui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "theoui/components/input-group";
import { Spinner } from "theoui/components/spinner";
import { ssoPlugin } from "theoui/lib/auth/sso-plugin";
import { cn } from "theoui/lib/utils";
import { useAuthForm } from "../auth-form";

export type SsoDomainVerificationProps = {
  className?: string;
  defaultProviderId?: string;
  defaultToken?: string;
  tokenPrefix?: string;
};

const getErrorMessage = (error: Error | null) => {
  const authError = error as BetterFetchError | null;
  return authError?.error?.message ?? authError?.message;
};

/** DNS token renewal and verification for an existing SSO provider. */
export function SsoDomainVerification({
  className,
  defaultProviderId = "",
  defaultToken = "",
  tokenPrefix = "better-auth-token",
}: SsoDomainVerificationProps) {
  const { authClient, localization: authLocalization } = useAuth();
  const { localization } = useAuthPlugin(ssoPlugin);
  const [token, setToken] = useState(defaultToken);
  const [verified, setVerified] = useState(false);
  const [copyError, setCopyError] = useState("");
  const requestToken = useRequestSsoDomainVerification(
    authClient as SsoAuthClient,
    {
      onSuccess: (data) => setToken(data.domainVerificationToken),
    },
  );
  const verify = useVerifySsoDomain(authClient as SsoAuthClient, {
    onSuccess: () => setVerified(true),
  });
  const hostCopy = useCopyToClipboard({
    onError: (error) => {
      console.error("[Better Auth UI] Copy failed", error);
      setCopyError(authLocalization.errors.copyFailed);
    },
  });
  const tokenCopy = useCopyToClipboard({
    onError: (error) => {
      console.error("[Better Auth UI] Copy failed", error);
      setCopyError(authLocalization.errors.copyFailed);
    },
  });
  const error =
    requestToken.submittedAt > verify.submittedAt
      ? requestToken.error
      : verify.error;

  const form = useAuthForm({
    defaultValues: { providerId: defaultProviderId },
    onSubmit: async ({ value }) => {
      setCopyError("");
      setVerified(false);
      await verify.mutateAsync({ providerId: value.providerId });
    },
  });

  return (
    <Card className={cn("w-full max-w-xl", className)}>
      <CardHeader>
        <CardTitle>{localization.domainVerification}</CardTitle>
        <CardDescription>
          {localization.domainVerificationDescription}
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <form.AppForm>
          <form.AuthFormRoot>
            <form.Subscribe selector={(state) => state.values.providerId}>
              {(providerId) => {
                const host = providerId ? `_${tokenPrefix}-${providerId}` : "";
                return (
                  <div className="flex flex-col gap-4">
                    <form.AppField name="providerId">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor="sso-verification-provider-id">
                            {localization.providerId}
                          </FieldLabel>
                          <Input
                            id="sso-verification-provider-id"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) => {
                              field.handleChange(event.target.value.trim());
                              setToken("");
                              setVerified(false);
                            }}
                            required
                          />
                        </Field>
                      )}
                    </form.AppField>

                    {token ? (
                      <div className="grid gap-3 rounded-lg border p-3">
                        <Field>
                          <FieldLabel htmlFor="sso-dns-host">
                            {localization.txtRecordHost}
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              className="font-mono text-xs"
                              id="sso-dns-host"
                              readOnly
                              value={host}
                            />
                            <InputGroupAddon align="inline-end">
                              <Button
                                type="button"
                                variant="ghost"
                                aria-label={localization.copyDnsHost}
                                size="icon-xs"
                                onClick={() => {
                                  setCopyError("");
                                  void hostCopy.copy(host);
                                }}
                              >
                                {hostCopy.copied ? <CheckIcon /> : <CopyIcon />}
                              </Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="sso-dns-value">
                            {localization.txtRecordValue}
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              className="font-mono text-xs"
                              id="sso-dns-value"
                              readOnly
                              value={token}
                            />
                            <InputGroupAddon align="inline-end">
                              <Button
                                type="button"
                                variant="ghost"
                                aria-label={localization.copyDnsValue}
                                size="icon-xs"
                                onClick={() => {
                                  setCopyError("");
                                  void tokenCopy.copy(token);
                                }}
                              >
                                {tokenCopy.copied ? (
                                  <CheckIcon />
                                ) : (
                                  <CopyIcon />
                                )}
                              </Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </Field>
                      </div>
                    ) : null}

                    {error ? (
                      <Alert variant="error">
                        <CircleAlertIcon aria-hidden="true" />
                        <AlertDescription>
                          {getErrorMessage(error)}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                    {copyError ? (
                      <Alert variant="error">
                        <CircleAlertIcon aria-hidden="true" />
                        <AlertDescription>{copyError}</AlertDescription>
                      </Alert>
                    ) : null}
                    {verified ? (
                      <Alert variant="success">
                        <CircleCheckIcon aria-hidden="true" />
                        <AlertDescription>
                          {localization.domainVerified}
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!providerId || verify.isPending}
                        onClick={() => {
                          setCopyError("");
                          setVerified(false);
                          requestToken.mutate({ providerId });
                        }}
                      >
                        {requestToken.isPending ? (
                          <Spinner data-icon="inline-start" />
                        ) : null}
                        {localization.requestNewToken}
                      </Button>
                      <form.AuthFormSubmitButton
                        isPending={verify.isPending}
                        disabled={!providerId || requestToken.isPending}
                      >
                        {localization.verifyDomain}
                      </form.AuthFormSubmitButton>
                    </div>

                    <span className="sr-only" aria-live="polite">
                      {token && !verified
                        ? localization.domainVerificationRequested
                        : ""}
                    </span>
                  </div>
                );
              }}
            </form.Subscribe>
          </form.AuthFormRoot>
        </form.AppForm>
      </CardPanel>
    </Card>
  );
}
