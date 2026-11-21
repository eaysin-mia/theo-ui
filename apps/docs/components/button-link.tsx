import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ButtonLinkProps = {
  direction: "previous" | "next";
  title: string;
  href: string;
};

export default function ButtonLink({
  direction,
  title,
  href,
}: ButtonLinkProps) {
  const isNext = direction === "next";

  return (
    <Link
      href={href}
      className={`group rounded-lg border p-3 transition-colors hover:bg-muted ${
        isNext ? "text-right" : "text-left"
      }`}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {!isNext && <ArrowLeft className="size-3" />}
        {isNext ? "Next" : "Previous"}
        {isNext && <ArrowRight className="size-3" />}
      </span>
      <span className="mt-1 block text-sm font-medium group-hover:underline">
        {title}
      </span>
    </Link>
  );
}
