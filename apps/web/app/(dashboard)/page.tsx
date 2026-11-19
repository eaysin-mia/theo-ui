"use client";

import { authClient } from "@/lib/auth-client";
import { useActiveOrganization, useSession } from "theoui/components/auth";
import { Badge } from "theoui/components/badge";
import { Button } from "theoui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "theoui/components/card";
import {
  Building2,
  Database,
  KeyRound,
  Lock,
  Palette,
  QrCode as QrCodeIcon,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Pattern } from "@/components/examples/c-timeline-4";
import { AutoHeightDemo } from "@/components/examples/c-auto-height-1";
import { CartButton } from "theoui/patterns/buttons/cart-button";
import { RainbowButton } from "theoui/patterns/buttons/rainbow-button";
import { ShimmerButton } from "theoui/patterns/buttons/shimmer-button";
import { UndoButton } from "theoui/patterns/buttons/undo-button";
import { HoldButton } from "theoui/patterns/buttons/hold-button";
import { HaloSearch } from "theoui/patterns/halo-search";
import { TipSelector } from "theoui/patterns/tip-selector";
import { UptimeCard } from "theoui/patterns/uptime-card";
import {
  RelativeTime,
  RelativeTimeZone,
  RelativeTimeZoneDate,
  RelativeTimeZoneDisplay,
  RelativeTimeZoneLabel,
} from "theoui/components/relative-time";

export default function DashboardOverviewPage() {
  const { data: session } = useSession(authClient);
  const { data: activeOrg } = useActiveOrganization(authClient);

  const user = session?.user;

  return (
    <div className="flex min-w-0 flex-col gap-8">
      {/* HaloSearch */}
      <div className="flex w-full justify-center">
        <HaloSearch
          className="w-full max-w-2xl"
          placeholder="Search docs, APIs, or ask a question..."
          shortcut="⌘K"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <HoldButton variant="destructive" />
        <HoldButton variant="default" />
        <HoldButton variant="info" />
        <UndoButton />
        <CartButton />
        <Button>Default Button</Button>
        <ShimmerButton>Get Unlimited Access</ShimmerButton>
        <RainbowButton>Get Unlimited Access</RainbowButton>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-start">
        <AutoHeightDemo />
        <TipSelector />
      </div>

      <div className="flex w-full justify-center">
        <UptimeCard />
      </div>

      <Pattern />
      <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-card to-muted/40 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {user?.name || "Guest"}
              </h1>
              {user && (
                <Badge variant="outline" className="text-xs font-semibold">
                  <UserCheck className="me-1 size-3 text-emerald-500" />
                  Authenticated
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user
                ? `Logged in as ${user.email}. Manage your profile, multi-factor security, and team organizations.`
                : "You are currently exploring in guest / unauthenticated mode. Sign in to unlock full features."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <Button render={<Link href="/auth/sign-in" />}>Sign In</Button>
            ) : (
              <Button
                variant="outline"
                render={<Link href="/settings/account" />}
              >
                Manage Profile
              </Button>
            )}
          </div>
        </div>

        {/* Database status banner */}
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-background/60 p-3 text-xs backdrop-blur-sm">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Database className="size-4 text-emerald-500" />
            Database:
            <span className="font-mono text-muted-foreground">
              MongoDB (theo_auth)
            </span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Auth Engine:
            <span className="font-mono text-muted-foreground">
              Better Auth v1.7.18
            </span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            Active Role:
            <span className="font-mono text-muted-foreground capitalize">
              {(user as { role?: string })?.role || "user"}
            </span>
          </div>
        </div>
      </div>

      {/* RelativeTime - Official Kibo UI Preview */}
      <div className="flex w-full justify-center">
        <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-4 shadow-xs">
          <RelativeTime className="grid gap-2 text-xs">
            <RelativeTimeZone zone="America/New_York">
              <RelativeTimeZoneLabel>EST</RelativeTimeZoneLabel>
              <RelativeTimeZoneDate />
              <RelativeTimeZoneDisplay />
            </RelativeTimeZone>
            <RelativeTimeZone zone="Europe/London">
              <RelativeTimeZoneLabel>GMT</RelativeTimeZoneLabel>
              <RelativeTimeZoneDate />
              <RelativeTimeZoneDisplay />
            </RelativeTimeZone>
            <RelativeTimeZone zone="Asia/Tokyo">
              <RelativeTimeZoneLabel>JST</RelativeTimeZoneLabel>
              <RelativeTimeZoneDate />
              <RelativeTimeZoneDisplay />
            </RelativeTimeZone>
          </RelativeTime>
        </div>
      </div>

      {/* Grid of Quick Action Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Security & 2FA Card */}
        <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="size-5" />
            </div>
            <CardTitle className="mt-3 text-lg">Security & 2FA</CardTitle>
            <CardDescription>
              Passkeys, two-factor authenticator app, and active session
              controls.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href="/settings/security" />}
            >
              Open Security
            </Button>
          </CardFooter>
        </Card>

        {/* Organizations Card */}
        <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="size-5" />
            </div>
            <CardTitle className="mt-3 text-lg">Organizations</CardTitle>
            <CardDescription>
              {activeOrg
                ? `Active in ${activeOrg.name}. Manage members, invitations, and roles.`
                : "Manage workspace teams, member permissions, and invites."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href="/settings/organizations" />}
            >
              View Organizations
            </Button>
          </CardFooter>
        </Card>

        {/* API Keys Card */}
        <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound className="size-5" />
            </div>
            <CardTitle className="mt-3 text-lg">API Keys</CardTitle>
            <CardDescription>
              Generate and revoke personal and organization developer access
              tokens.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href="/settings/security" />}
            >
              Manage Keys
            </Button>
          </CardFooter>
        </Card>

        {/* Appearance Card */}
        <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Palette className="size-5" />
            </div>
            <CardTitle className="mt-3 text-lg">Appearance</CardTitle>
            <CardDescription>
              Switch between Light, Dark, and System themes using Coss UI image
              cards.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              render={<Link href="/settings/account" />}
            >
              Change Theme
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Admin Panel Promo (if admin) */}
      {(user as { role?: string })?.role === "admin" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <CardTitle className="text-lg">
                  Administration Console
                </CardTitle>
              </div>
              <Badge variant="default">Admin Only</Badge>
            </div>
            <CardDescription>
              You have administrator privileges. You can manage registered
              users, assign roles, ban suspicious accounts, and audit sessions.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button render={<Link href="/admin/users" />}>
              Open Admin Users Table
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
