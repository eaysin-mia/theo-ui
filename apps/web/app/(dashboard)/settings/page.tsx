"use client";

import Link from "next/link";
import { SettingsDirectory } from "theoui/auth";

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
