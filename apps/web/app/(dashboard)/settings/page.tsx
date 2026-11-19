"use client";

import Link from "next/link";
import { SettingsDirectory } from "theoui/components/auth/settings/settings-directory";

export default function SettingsIndexPage() {
  return (
    <SettingsDirectory
      renderLink={({ href, className, children }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    />
  );
}
