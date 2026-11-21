"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { docSections, getDocHref } from "@/lib/docs";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Search documentation"
        className="w-9 justify-center px-0 sm:w-56 sm:justify-between sm:px-2.5"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Search />
          <span className="hidden sm:inline">Search documentation...</span>
        </span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Search the documentation pages."
        className="top-[20%] sm:max-w-xl"
      >
        <Command>
          <CommandInput placeholder="Search documentation..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {docSections.map((section) => (
              <CommandGroup key={section.title} heading={section.title}>
                {section.docs.map((doc) => (
                  <CommandItem
                    key={doc.slug}
                    value={`${doc.title} ${doc.section} ${doc.description} ${doc.keywords.join(" ")}`}
                    onSelect={() => {
                      setOpen(false);
                      router.push(getDocHref(doc));
                    }}
                  >
                    <FileText className="text-muted-foreground" />
                    <span>{doc.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
