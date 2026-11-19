"use client";

import Link from "next/link";
import { SettingsDirectory } from "theo-ui/components/auth/settings/settings-directory";

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
