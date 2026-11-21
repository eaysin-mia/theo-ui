"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { docSections, getDocHref } from "@/lib/docs";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            className="md:hidden"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Documentation</SheetTitle>
          <SheetDescription>Browse guides and components.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile documentation navigation" className="px-4 pb-6">
          <Link
            href="/docs/getting-started/introduction"
            onClick={() => setOpen(false)}
            className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
          >
            Docs
          </Link>
          <Link
            href="/docs/components"
            onClick={() => setOpen(false)}
            className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
          >
            Components
          </Link>
          {docSections.map((section) => (
            <div key={section.title} className="mt-4">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {section.title}
              </p>
              {section.docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={getDocHref(doc)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {doc.title}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
