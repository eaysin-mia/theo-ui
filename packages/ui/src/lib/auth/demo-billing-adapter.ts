import type {
  BillingActionResult,
  BillingAdapter,
  BillingCheckoutInput,
  BillingPlan,
  BillingScope,
  BillingState,
} from "@better-auth-ui/core/plugins/billing";

export const DEMO_BILLING_PLANS: BillingPlan[] = [
  {
    id: "plan_free",
    name: "Starter",
    description: "Essential features for individuals and small hobby projects.",
    prices: [
      {
        id: "price_free_month",
        amount: 0,
        currency: "USD",
        interval: "month",
      },
    ],
    features: [
      "Up to 10,000 requests / mo",
      "1 team member",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    id: "plan_pro",
    name: "Pro",
    description: "Advanced capabilities and scale for growing teams.",
    highlighted: true,
    seatBased: true,
    prices: [
      {
        id: "price_pro_month",
        amount: 2900, // $29.00
        currency: "USD",
        interval: "month",
      },
      {
        id: "price_pro_year",
        amount: 29000, // $290.00 ($24/mo)
        currency: "USD",
        interval: "year",
      },
    ],
    features: [
      "100,000 requests / mo",
      "Up to 10 team seats",
      "Priority email support",
      "Custom domain & webhooks",
      "Audit logs (90 days)",
    ],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    description: "Maximum performance, security, and dedicated SLA.",
    seatBased: true,
    prices: [
      {
        id: "price_enterprise_month",
        amount: 9900, // $99.00
        currency: "USD",
        interval: "month",
      },
      {
        id: "price_enterprise_year",
        amount: 99000, // $990.00
        currency: "USD",
        interval: "year",
      },
    ],
    features: [
      "Unlimited API requests",
      "Unlimited team seats",
      "24/7 dedicated support & SLA",
      "Custom SSO / SAML integration",
      "Unlimited audit log retention",
    ],
  },
];

export function createDemoBillingAdapter(): BillingAdapter {
  const stateMap = new Map<string, BillingState>();

  const getScopeKey = (scope: BillingScope) =>
    scope.type === "user"
      ? `user:${scope.userId}`
      : `org:${scope.organizationId}`;

  const getInitialState = (): BillingState => ({
    subscription: {
      id: "sub_demo_12345",
      planId: "plan_pro",
      priceId: "price_pro_month",
      interval: "month",
      planName: "Pro",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      seats: 3,
    },
    usage: [
      {
        id: "usage_api_requests",
        label: "API Requests",
        used: 42500,
        limit: 100000,
        unit: "requests",
      },
      {
        id: "usage_seats",
        label: "Team Seats",
        used: 3,
        limit: 10,
        unit: "seats",
      },
      {
        id: "usage_storage",
        label: "Storage Space",
        used: 4.2,
        limit: 10,
        unit: "GB",
      },
    ],
  });

  return {
    id: "demo-billing",
    supports: {
      cancel: true,
      restore: true,
      seats: true,
    },
    scopes: {
      user: true,
      organization: true,
    },
    async listPlans(): Promise<BillingPlan[]> {
      return DEMO_BILLING_PLANS;
    },
    async getState(scope: BillingScope): Promise<BillingState> {
      const key = getScopeKey(scope);
      let state = stateMap.get(key);
      if (!state) {
        state = getInitialState();
        stateMap.set(key, state);
      }
      return state;
    },
    async checkout(
      scope: BillingScope,
      input: BillingCheckoutInput,
    ): Promise<BillingActionResult> {
      const key = getScopeKey(scope);
      const plan = DEMO_BILLING_PLANS.find(
        (p: BillingPlan) => p.id === input.planId,
      );
      const price = plan?.prices.find((pr) => pr.id === input.priceId);
      const current = stateMap.get(key) ?? getInitialState();

      stateMap.set(key, {
        ...current,
        subscription: {
          id: `sub_demo_${Date.now()}`,
          planId: input.planId,
          priceId: input.priceId,
          interval: price?.interval ?? "month",
          planName: plan?.name ?? "Custom Plan",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          seats: input.seats ?? current.subscription?.seats ?? 1,
        },
      });
      return {};
    },
    async openPortal(): Promise<BillingActionResult> {
      return {};
    },
    async cancel(
      scope: BillingScope,
      _subscriptionId: string,
    ): Promise<BillingActionResult> {
      const key = getScopeKey(scope);
      const current = stateMap.get(key) ?? getInitialState();
      if (current.subscription) {
        stateMap.set(key, {
          ...current,
          subscription: {
            ...current.subscription,
            cancelAtPeriodEnd: true,
            canceledAt: new Date(),
          },
        });
      }
      return {};
    },
    async restore(
      scope: BillingScope,
      _subscriptionId: string,
    ): Promise<BillingActionResult> {
      const key = getScopeKey(scope);
      const current = stateMap.get(key) ?? getInitialState();
      if (current.subscription) {
        stateMap.set(key, {
          ...current,
          subscription: {
            ...current.subscription,
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
            status: "active",
          },
        });
      }
      return {};
    },
    async updateSeats(
      scope: BillingScope,
      _subscriptionId: string,
      seats: number,
    ): Promise<BillingActionResult> {
      const key = getScopeKey(scope);
      const current = stateMap.get(key) ?? getInitialState();
      if (current.subscription) {
        stateMap.set(key, {
          ...current,
          subscription: {
            ...current.subscription,
            seats,
          },
        });
      }
      return {};
    },
  };
}
