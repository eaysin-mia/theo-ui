import Link from "next/link";
import { CodeXml } from "lucide-react";

import { MobileNavigation } from "@/components/mobile-navigation";
import { SearchCommand } from "@/components/search-command";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

const sourceUrl = "https://github.com/hetari/shadcn-docs-template";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center gap-6 px-4 sm:px-6">
        <MobileNavigation />
        <Link
          href="/"
          aria-label="Next docs home"
          className="flex items-center"
        >
          <CodeXml className="size-5 text-emerald-500" />
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 text-sm md:flex"
        >
          <Link
            href="/docs/getting-started/introduction"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="/docs/components"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Components
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchCommand />
          <Separator
            orientation="vertical"
            className="mx-1 hidden h-4 sm:block"
          />
          <Link
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Source repository on GitHub"
            className="inline-flex items-center gap-1.5 rounded-md p-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="hidden sm:inline">GitHub</span>
            <span className="hidden sm:inline">27</span>
            <span className="sm:hidden">GH</span>
          </Link>
          <Separator
            orientation="vertical"
            className="mx-1 hidden h-4 sm:block"
          />
          <Link
            href="https://x.com/hetaridev"
            target="_blank"
            rel="noreferrer"
            aria-label="Template author on X"
            className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            X
          </Link>
          <Separator
            orientation="vertical"
            className="mx-1 hidden h-4 sm:block"
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
