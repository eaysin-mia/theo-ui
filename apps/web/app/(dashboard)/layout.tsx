import { cookies } from "next/headers";
import { DashboardShell } from "./dashboard-shell";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>;
}
