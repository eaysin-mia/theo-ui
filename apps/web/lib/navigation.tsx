import type { NavMainItem } from "theoui/patterns/app-layout";
import {
  HomeIcon,
  SettingsIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "lucide-react";

export const dashboardNavItems: NavMainItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: <HomeIcon />,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: <SparklesIcon />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <SettingsIcon />,
    items: [
      {
        title: "Overview",
        url: "/settings",
      },
      {
        title: "Account & Preferences",
        url: "/settings/account",
      },
      {
        title: "Security & 2FA",
        url: "/settings/security",
      },
      {
        title: "Organizations",
        url: "/settings/organizations",
      },
      {
        title: "OAuth Apps",
        url: "/settings/oauth-clients",
      },
      {
        title: "Billing & Plans",
        url: "/settings/billing",
      },
    ],
  },
  {
    title: "Administration",
    url: "/admin/users",
    icon: <ShieldAlertIcon />,
    items: [
      {
        title: "User Management",
        url: "/admin/users",
      },
    ],
  },
];
