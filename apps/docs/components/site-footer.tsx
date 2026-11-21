import Link from "next/link";

export function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-center px-4 text-center text-xs text-muted-foreground sm:px-6 sm:text-sm">
        <span>
          &copy; {new Date().getFullYear()} - Built with{" "}
          <Link
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            shadcn/ui
          </Link>
          . The source code is available on{" "}
          <Link
            href="https://github.com/hetari/shadcn-docs-template"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            GitHub
          </Link>
          .
        </span>
      </div>
    </footer>
  );
}
