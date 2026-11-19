"use client";

import * as React from "react";
import { Badge } from "theo-ui/components/badge";
import { Button } from "theo-ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "theo-ui/components/empty";
import { IconTile } from "theo-ui/components/icon-tile";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "theo-ui/components/input-group";
import { cn } from "theo-ui/lib/utils";
import {
  BellIcon,
  Building2Icon,
  CalendarIcon,
  Code2Icon,
  CreditCardIcon,
  FileCheckIcon,
  FileTextIcon,
  FingerprintIcon,
  GlobeIcon,
  KeyRoundIcon,
  LaptopIcon,
  LayersIcon,
  MailIcon,
  PaletteIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserCheckIcon,
  UserIcon,
  UsersIcon,
  VenetianMaskIcon,
  WebhookIcon,
  XIcon,
} from "lucide-react";

export type SettingsDirectoryItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: "Recommended" | "Fast" | "Beta" | string;
  keywords?: string[];
};

export type SettingsDirectorySection = {
  id: string;
  title: string;
  description?: string;
  items: SettingsDirectoryItem[];
};

const defaultSettingsSections: SettingsDirectorySection[] = [
  {
    id: "personal",
    title: "Personal settings",
    description:
      "Manage your profile, account preferences, and personal details.",
    items: [
      {
        id: "profile",
        title: "Profile",
        description:
          "Manage your profile details, display username, and avatar.",
        href: "/settings/account",
        icon: <UserIcon aria-hidden="true" />,
        keywords: ["account", "name", "email", "avatar", "username", "profile"],
      },
      {
        id: "general",
        title: "General",
        description:
          "Manage language, timezone, and account localization preferences.",
        href: "/settings/account",
        icon: <SlidersHorizontalIcon aria-hidden="true" />,
        keywords: ["general", "language", "timezone", "locale", "preferences"],
      },
      {
        id: "appearance",
        title: "Appearance",
        description:
          "Customize theme, dark mode behavior, and interface branding.",
        href: "/settings/account",
        icon: <PaletteIcon aria-hidden="true" />,
        keywords: ["theme", "dark", "light", "mode", "color", "appearance"],
      },
      {
        id: "notifications",
        title: "Notifications",
        description:
          "Configure email alerts, digest frequency, and channel delivery.",
        href: "/settings/account",
        icon: <BellIcon aria-hidden="true" />,
        keywords: ["notifications", "email", "alerts", "messages", "digest"],
      },
      {
        id: "calendars",
        title: "Calendars & Sync",
        description:
          "Connect and manage your Google, Outlook, or CalDAV integrations.",
        href: "/settings/account",
        icon: <CalendarIcon aria-hidden="true" />,
        keywords: ["calendars", "google", "outlook", "sync", "events"],
      },
      {
        id: "sessions",
        title: "Active Sessions",
        description:
          "View active browser logins, connected devices, and sign out remotely.",
        href: "/settings/security",
        icon: <LaptopIcon aria-hidden="true" />,
        keywords: ["sessions", "devices", "logins", "security", "browsers"],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    description:
      "Protect your account with multi-factor authentication and credentials.",
    items: [
      {
        id: "password",
        title: "Password",
        description:
          "Update your account password or manage primary sign-in credentials.",
        href: "/settings/security",
        icon: <KeyRoundIcon aria-hidden="true" />,
        keywords: ["password", "change", "reset", "credentials", "login"],
      },
      {
        id: "two-factor",
        title: "Two-Factor Authentication",
        description:
          "Add an extra layer of protection using TOTP authenticator apps.",
        href: "/settings/security",
        icon: <ShieldCheckIcon aria-hidden="true" />,
        badge: "Recommended",
        keywords: ["2fa", "two-factor", "totp", "authenticator", "mfa", "otp"],
      },
      {
        id: "passkeys",
        title: "Passkeys",
        description:
          "Sign in seamlessly with biometric Touch ID, Face ID, or hardware keys.",
        href: "/settings/security",
        icon: <FingerprintIcon aria-hidden="true" />,
        badge: "Fast",
        keywords: ["passkeys", "webauthn", "biometrics", "fido2", "yubikey"],
      },
      {
        id: "impersonation",
        title: "Impersonation",
        description:
          "Allow verified support staff to sign in on your behalf for debugging.",
        href: "/settings/security",
        icon: <VenetianMaskIcon aria-hidden="true" />,
        keywords: ["impersonation", "support", "debug", "permissions"],
      },
      {
        id: "audit-logs",
        title: "Security & Audit Logs",
        description:
          "Review security events, IP access history, and session audit trails.",
        href: "/settings/security",
        icon: <UserCheckIcon aria-hidden="true" />,
        keywords: ["audit", "logs", "security", "history", "events"],
      },
      {
        id: "compliance",
        title: "Compliance & Privacy",
        description:
          "Manage GDPR compliance, request personal data exports, or delete account.",
        href: "/settings/security",
        icon: <FileCheckIcon aria-hidden="true" />,
        keywords: ["compliance", "privacy", "gdpr", "export", "delete", "data"],
      },
    ],
  },
  {
    id: "organizations",
    title: "Organizations & Teams",
    description:
      "Collaborate across multi-tenant workspaces, teams, and members.",
    items: [
      {
        id: "org-management",
        title: "Organizations",
        description:
          "Manage your active organization workspaces, domains, and branding.",
        href: "/settings/organizations",
        icon: <Building2Icon aria-hidden="true" />,
        keywords: ["organization", "org", "company", "workspace", "teams"],
      },
      {
        id: "org-members",
        title: "Team Members",
        description:
          "Invite teammates, manage membership roles, and oversee permissions.",
        href: "/settings/organizations",
        icon: <UsersIcon aria-hidden="true" />,
        keywords: ["members", "invites", "team", "roles", "permissions"],
      },
      {
        id: "org-invites",
        title: "Invites & Access",
        description:
          "Review pending email invitations, domain rules, and auto-join settings.",
        href: "/settings/organizations",
        icon: <MailIcon aria-hidden="true" />,
        keywords: ["invites", "pending", "email", "access", "domain"],
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Plans",
    description:
      "Manage subscription plans, invoices, and billing contact details.",
    items: [
      {
        id: "manage-billing",
        title: "Manage Billing",
        description:
          "View and update current payment methods, credit card on file, and tax IDs.",
        href: "/settings/billing",
        icon: <CreditCardIcon aria-hidden="true" />,
        keywords: [
          "billing",
          "payment",
          "card",
          "stripe",
          "invoice",
          "receipts",
        ],
      },
      {
        id: "plans",
        title: "Plans & Tiers",
        description:
          "Compare available plan tiers, upgrade workspace seats, and check usage quotas.",
        href: "/settings/billing",
        icon: <LayersIcon aria-hidden="true" />,
        keywords: [
          "plans",
          "upgrade",
          "subscription",
          "pricing",
          "tiers",
          "seats",
        ],
      },
      {
        id: "invoices",
        title: "Invoices & Receipts",
        description:
          "Download past invoices, billing statements, and VAT breakdown PDFs.",
        href: "/settings/billing",
        icon: <FileTextIcon aria-hidden="true" />,
        keywords: ["invoices", "receipts", "vat", "tax", "statements"],
      },
    ],
  },
  {
    id: "developer",
    title: "Developer",
    description:
      "Tools and APIs for integrating, extending, and automating your workflow.",
    items: [
      {
        id: "oauth-clients",
        title: "OAuth Clients",
        description:
          "Register and manage third-party OAuth applications and redirect URIs.",
        href: "/settings/oauth-clients",
        icon: <GlobeIcon aria-hidden="true" />,
        keywords: ["oauth", "apps", "client", "developer", "tokens"],
      },
      {
        id: "api-keys",
        title: "API Keys",
        description:
          "Create, rotate, and revoke secret API keys for programmatic access.",
        href: "/settings/oauth-clients",
        icon: <Code2Icon aria-hidden="true" />,
        keywords: ["api", "keys", "tokens", "developer", "sdk", "rest"],
      },
      {
        id: "webhooks",
        title: "Webhooks",
        description:
          "Subscribe to real-time events and deliver webhook payloads to your server.",
        href: "/settings/oauth-clients",
        icon: <WebhookIcon aria-hidden="true" />,
        keywords: ["webhooks", "events", "http", "callbacks", "integrations"],
      },
    ],
  },
];

export interface SettingsDirectoryProps {
  className?: string;
  sections?: SettingsDirectorySection[];
  renderLink?: (props: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => React.ReactElement;
}

export function SettingsDirectory({
  className,
  sections = defaultSettingsSections,
  renderLink,
}: SettingsDirectoryProps) {
  const [query, setQuery] = React.useState("");

  const trimmedQuery = query.trim().toLowerCase();

  const filteredSections = React.useMemo(() => {
    if (!trimmedQuery) {
      return sections;
    }

    return sections
      .map((section) => {
        const matchingItems = section.items.filter((item) => {
          const matchTitle = item.title.toLowerCase().includes(trimmedQuery);
          const matchDesc = item.description
            .toLowerCase()
            .includes(trimmedQuery);
          const matchKeywords = item.keywords?.some((k) =>
            k.toLowerCase().includes(trimmedQuery),
          );
          return matchTitle || matchDesc || matchKeywords;
        });

        return {
          ...section,
          items: matchingItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [sections, trimmedQuery]);

  const defaultRenderLink = ({
    href,
    className: linkClassName,
    children,
  }: {
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a href={href} className={linkClassName}>
      {children}
    </a>
  );

  const LinkComponent = renderLink ?? defaultRenderLink;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-10 py-2 md:py-4",
        className,
      )}
    >
      {/* 1. Header with Title and Search Input (Particle p-input-group-20) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal account, security preferences, and workspace
            integrations.
          </p>
        </div>

        {/* Particle p-input-group-20: Input group with search icon */}
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search settings"
            placeholder="Search settings..."
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => setQuery("")}
                className="cursor-pointer rounded text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon aria-hidden="true" className="size-4" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {/* 2. Categorized Sections Grid */}
      {filteredSections.length > 0 ? (
        <div className="flex flex-col gap-10">
          {filteredSections.map((section) => (
            <section key={section.id} className="flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {section.description}
                  </p>
                )}
              </div>

              {/* 3-Column Responsive Grid with balanced items */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => {
                  const cardContent = (
                    <>
                      {/* Left Icon: Coss UI IconTile primitive */}
                      <IconTile
                        variant="outline"
                        size="default"
                        className="text-muted-foreground transition-colors group-hover:border-border group-hover:bg-background group-hover:text-foreground group-hover:shadow-xs"
                      >
                        {item.icon}
                      </IconTile>

                      {/* Right Details */}
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badge === "Recommended"
                                  ? "success"
                                  : item.badge === "Fast"
                                    ? "info"
                                    : "outline"
                              }
                              size="sm"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </>
                  );

                  return (
                    <LinkComponent
                      key={item.id}
                      href={item.href}
                      className="group relative flex items-start gap-3.5 rounded-xl border border-border/60 bg-card/50 p-4 transition-all duration-200 hover:border-border hover:bg-accent/40 hover:shadow-xs active:scale-[0.99]"
                    >
                      {cardContent}
                    </LinkComponent>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Empty State using Coss UI Empty primitive & particle pattern */
        <Empty className="rounded-xl border border-dashed border-border/60 py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No settings found</EmptyTitle>
            <EmptyDescription>
              No settings match your search for &ldquo;{query}&rdquo;.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
