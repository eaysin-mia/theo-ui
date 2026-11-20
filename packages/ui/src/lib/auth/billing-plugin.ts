import { createAuthPlugin } from "@better-auth-ui/core";
import {
  type BillingPluginOptions,
  billingPlugin as coreBillingPlugin,
} from "@better-auth-ui/core/plugins/billing";
import { CreditCard } from "lucide-react";
import { createElement, Fragment } from "react";

import {
  OrganizationBillingSettings,
  UserBillingSettings,
} from "#auth/billing/billing-settings";

const billingLabel = (label: string) =>
  createElement(
    Fragment,
    null,
    createElement(CreditCard, { className: "text-muted-foreground" }),
    label,
  );

export {
  createDemoBillingAdapter,
  DEMO_BILLING_PLANS,
} from "./demo-billing-adapter";
export type {
  BillingAdapter,
  BillingPlan,
  BillingPluginOptions,
  BillingPrice,
  BillingScope,
  BillingState,
  BillingSubscription,
} from "@better-auth-ui/core/plugins/billing";

export const billingPlugin = createAuthPlugin(
  coreBillingPlugin.id,
  (options: BillingPluginOptions) => {
    const core = coreBillingPlugin(options);
    return {
      ...core,
      ...(core.user
        ? {
            settingsTabs: [
              {
                view: "billing" as const,
                label: billingLabel(core.localization.billing),
                component: UserBillingSettings,
              },
            ],
          }
        : {}),
      ...(core.organization
        ? {
            organizationTabs: [
              {
                id: "billing",
                path: core.viewPaths.settings.billing,
                label: billingLabel(core.localization.billing),
                component: OrganizationBillingSettings,
              },
            ],
          }
        : {}),
    };
  },
);
