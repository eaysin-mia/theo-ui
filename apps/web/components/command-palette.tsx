"use client";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  CircleQuestionMarkIcon,
  CornerDownLeftIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAutocompleteFilter } from "theoui/components/autocomplete";
import { Button } from "theoui/components/button";
import {
  Command,
  CommandCollection,
  CommandCreateHandle,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
  EmptyMedia,
  Input,
  Kbd,
  KbdGroup,
  ScrollArea,
  Skeleton,
  Spinner,
} from "theoui";

interface Item {
  value: string;
  label: string;
  shortcut?: string;
  keywords?: string[];
  url?: string;
}

interface Group {
  value: string;
  items: Item[];
}

const commandGroups: Group[] = [
  {
    items: [
      {
        keywords: ["dash", "overview"],
        label: "Dashboard",
        shortcut: "d",
        value: "dashboard",
        url: "/",
      },
      {
        keywords: ["chat", "ai", "claude", "reasoning"],
        label: "AI Chat",
        shortcut: "c",
        value: "chat",
        url: "/chat",
      },
      {
        keywords: ["settings", "preferences"],
        label: "Settings",
        shortcut: "s",
        value: "settings",
        url: "/settings",
      },
      {
        keywords: ["admin", "users", "team"],
        label: "User Management",
        shortcut: "u",
        value: "users",
        url: "/admin/users",
      },
    ],
    value: "Pages",
  },
  {
    items: [
      {
        keywords: ["mfa", "2fa", "security"],
        label: "Security & 2FA",
        shortcut: "s s",
        value: "security",
        url: "/settings/security",
      },
      {
        keywords: ["org", "teams", "workspaces"],
        label: "Organizations",
        shortcut: "s o",
        value: "organizations",
        url: "/settings/organizations",
      },
      {
        keywords: ["billing", "plans", "invoices"],
        label: "Billing & Plans",
        shortcut: "s b",
        value: "billing",
        url: "/settings/billing",
      },
    ],
    value: "Settings",
  },
  {
    items: [
      {
        keywords: ["docs", "help"],
        label: "Documentation",
        shortcut: "d o",
        value: "docs",
        url: "/settings",
      },
      {
        keywords: ["support", "help"],
        label: "Support",
        shortcut: "s u",
        value: "support",
        url: "/settings",
      },
    ],
    value: "Help",
  },
];

const MOCK_AI_RESPONSE = `Theo UI is an AI-first web UI library and application template built with **Coss UI** and **Base UI** primitives.

It features dark mode theming, an interactive multi-agent chat system with tokenized mention autocomplete, reasoning traces, syntax-highlighted code blocks, and Cal.com-inspired settings management.

You can explore full interactive workflows in the **AI Chat** interface or navigate through your account preferences in the **Settings** directory.`;

const MOCK_REFERENCE_LINKS = [
  { title: "Dashboard", url: "/" },
  { title: "AI Chat Interface", url: "/chat" },
  { title: "Settings Directory", url: "/settings" },
  { title: "User Management", url: "/admin/users" },
];

export const commandHandle: ReturnType<typeof CommandCreateHandle> =
  CommandCreateHandle();

interface AIState {
  mode: boolean;
  query: string;
  submittedQuery: string;
  response: string;
  referenceLinks: Array<{ title: string; url: string }>;
  isGenerating: boolean;
  error: string | null;
}

const initialAIState: AIState = {
  error: null,
  isGenerating: false,
  mode: false,
  query: "",
  referenceLinks: [],
  response: "",
  submittedQuery: "",
};

function markdownToSafeHTML(markdown: string): string {
  return markdown
    .split("\n\n")
    .map((para) => `<p>${para}</p>`)
    .join("");
}

interface CommandPaletteContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openWithQuery: (query?: string) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(
  null,
);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return context;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [aiState, setAIState] = useState<AIState>(initialAIState);
  const [searchQuery, setSearchQuery] = useState("");
  const aiInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const commandResetKeyRef = useRef(0);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const openWithQuery = useCallback((initialQuery?: string) => {
    setOpen(true);
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, []);

  const resetAIState = useCallback(() => {
    abortControllerRef.current?.abort();
    setAIState(initialAIState);
  }, []);

  const handleItemClick = useCallback(
    (item: Item) => {
      setOpen(false);
      if (item.url) {
        router.push(item.url);
      }
    },
    [router],
  );

  const handleBackToSearch = useCallback(() => {
    resetAIState();
    setSearchQuery("");
    commandResetKeyRef.current += 1;
    searchInputRef.current?.focus();
  }, [resetAIState]);

  const handleGenerateAI = useCallback(
    async (queryOverride?: string) => {
      const query = queryOverride || aiState.query;
      if (!query.trim()) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setAIState((prev) => ({
        ...prev,
        error: null,
        isGenerating: true,
        query: "",
        referenceLinks: [],
        response: "",
        submittedQuery: query,
      }));

      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, 1500);
          controller.signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new Error("aborted"));
          });
        });

        if (controller.signal.aborted) return;

        setAIState((prev) => ({
          ...prev,
          isGenerating: false,
          referenceLinks: MOCK_REFERENCE_LINKS,
          response: MOCK_AI_RESPONSE,
        }));
      } catch (error) {
        if (error instanceof Error && error.message === "aborted") {
          return;
        }

        if (controller.signal.aborted) return;

        setAIState((prev) => ({
          ...prev,
          error: "Failed to generate response. Please try again.",
          isGenerating: false,
        }));
      }
    },
    [aiState.query],
  );

  const handleAskAI = useCallback(() => {
    const currentQuery = searchQuery;
    setSearchQuery("");

    if (currentQuery.trim()) {
      setAIState((prev) => ({ ...prev, mode: true }));
      handleGenerateAI(currentQuery);
    } else {
      setAIState((prev) => ({ ...prev, mode: true, query: "" }));
      aiInputRef.current?.focus();
    }
  }, [searchQuery, handleGenerateAI]);

  const { contains } = useAutocompleteFilter({ sensitivity: "base" });

  const filterItem = useCallback(
    (itemValue: unknown, query: string): boolean => {
      if (typeof itemValue !== "object" || itemValue === null) {
        return false;
      }

      const item = itemValue as Item;

      if (contains(item.label, query)) {
        return true;
      }

      if (contains(item.value, query)) {
        return true;
      }

      if (item.keywords?.some((keyword) => contains(keyword, query))) {
        return true;
      }

      return false;
    },
    [contains],
  );

  useEffect(() => {
    if (!open || !aiState.mode) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleBackToSearch();
      }
    };

    document.addEventListener("keydown", handleEscape, true);
    return () => document.removeEventListener("keydown", handleEscape, true);
  }, [open, aiState.mode, handleBackToSearch]);

  useEffect(() => {
    if (aiState.mode && !aiState.isGenerating) {
      aiInputRef.current?.focus();
    }
  }, [aiState.mode, aiState.isGenerating]);

  const hasResults = useMemo(
    () =>
      !searchQuery.trim() ||
      commandGroups.some((group) =>
        group.items.some((item) => filterItem(item, searchQuery)),
      ),
    [searchQuery, filterItem],
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setSearchQuery("");
        resetAIState();
      }
    },
    [resetAIState],
  );

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, openWithQuery }}>
      {children}
      <CommandDialog
        handle={commandHandle}
        onOpenChange={handleOpenChange}
        open={open}
      >
        <CommandDialogPopup>
          {!aiState.mode ? (
            <Command
              filter={filterItem}
              items={commandGroups}
              key={commandResetKeyRef.current}
            >
              <div className="relative flex items-center *:first:flex-1">
                <CommandInput
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      handleAskAI();
                    }
                    if (
                      e.key === "Enter" &&
                      !hasResults &&
                      searchQuery.trim()
                    ) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                  placeholder="Type a command or search..."
                  ref={searchInputRef}
                  value={searchQuery}
                />
                <Button
                  className="me-2.5 rounded-md text-sm not-hover:text-muted-foreground sm:text-xs"
                  onClick={handleAskAI}
                  size="sm"
                  variant="ghost"
                >
                  <SparklesIcon className="size-4 sm:size-3.5" />
                  Ask AI
                  <Kbd className="ms-0.5 -me-1.5">Tab</Kbd>
                </Button>
              </div>
              <CommandPanel>
                <CommandEmpty className="not-empty:py-12">
                  {searchQuery.trim() ? (
                    <div className="flex flex-col flex-wrap items-center gap-2 wrap-break-word">
                      <EmptyMedia variant="icon">
                        <SearchIcon />
                      </EmptyMedia>
                      <p>No results found.</p>
                      <p>
                        Press <Kbd>Enter</Kbd> to ask AI about:
                        <br />{" "}
                        <strong className="font-medium text-foreground">
                          {searchQuery}
                        </strong>
                      </p>
                    </div>
                  ) : null}
                </CommandEmpty>
                <CommandList>
                  {(group: Group) => (
                    <Fragment key={group.value}>
                      <CommandGroup items={group.items}>
                        <CommandGroupLabel>{group.value}</CommandGroupLabel>
                        <CommandCollection>
                          {(item: Item) => (
                            <CommandItem
                              key={item.value}
                              onClick={() => handleItemClick(item)}
                              value={item}
                            >
                              <span className="flex-1">{item.label}</span>
                              {item.shortcut && (
                                <CommandShortcut>
                                  {item.shortcut}
                                </CommandShortcut>
                              )}
                            </CommandItem>
                          )}
                        </CommandCollection>
                      </CommandGroup>
                      <CommandSeparator />
                    </Fragment>
                  )}
                </CommandList>
              </CommandPanel>
              <CommandFooter>
                {hasResults ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <KbdGroup>
                          <Kbd>
                            <ArrowUpIcon />
                          </Kbd>
                          <Kbd>
                            <ArrowDownIcon />
                          </Kbd>
                        </KbdGroup>
                        <span>Navigate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Kbd>
                          <CornerDownLeftIcon />
                        </Kbd>
                        <span>Open</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Kbd>Esc</Kbd>
                      <span>Close</span>
                    </div>
                  </>
                ) : (
                  <div className="ms-auto flex items-center gap-2">
                    <Kbd>Esc</Kbd>
                    <span>Close</span>
                  </div>
                )}
              </CommandFooter>
            </Command>
          ) : (
            <Command>
              <div className="flex items-center *:first:flex-1">
                <div className="px-2.5 py-1.5">
                  <div className="relative w-full">
                    <div
                      aria-hidden="true"
                      className="inset-s-px pointer-events-none absolute inset-y-0 z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg]:-mx-0.5 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4"
                      data-slot="autocomplete-start-addon"
                    >
                      <SparklesIcon />
                    </div>
                    <Input
                      aria-label="AI query input"
                      className="border-transparent! bg-transparent! shadow-none before:hidden has-focus-visible:ring-0 *:data-[slot=input]:ps-[calc(--spacing(8.5)-1px)] sm:*:data-[slot=input]:ps-[calc(--spacing(8)-1px)]"
                      disabled={aiState.isGenerating}
                      onChange={(e) =>
                        setAIState((prev) => ({
                          ...prev,
                          query: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !aiState.isGenerating) {
                          handleGenerateAI();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          handleBackToSearch();
                        }
                      }}
                      placeholder="Ask AI anything…"
                      ref={aiInputRef}
                      size="lg"
                      value={aiState.query}
                    />
                  </div>
                </div>
                <Button
                  className="me-2.5 rounded-md text-sm not-hover:text-muted-foreground sm:text-xs"
                  onClick={handleBackToSearch}
                  size="sm"
                  variant="ghost"
                >
                  <ArrowLeftIcon className="size-4 sm:size-3.5" />
                  Back to search
                  <Kbd className="ms-0.5 -me-1.5">Esc</Kbd>
                </Button>
              </div>
              <CommandPanel>
                <ScrollArea overscrollContain scrollbarGutter scrollFade>
                  <div className="p-5">
                    {!aiState.isGenerating &&
                      !aiState.response &&
                      !aiState.error && (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-sm text-muted-foreground">
                            Ask AI anything and press <Kbd>Enter</Kbd> to get
                            started.
                          </p>
                        </div>
                      )}

                    {aiState.error && (
                      <div
                        aria-live="polite"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {aiState.error}
                      </div>
                    )}

                    {aiState.isGenerating && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                      </div>
                    )}

                    {aiState.response && !aiState.isGenerating && (
                      <>
                        <div
                          aria-live="polite"
                          className="text-sm text-muted-foreground **:[a]:underline **:[a]:underline-offset-4 **:[code]:rounded-md **:[code]:bg-muted **:[code]:px-[0.3rem] **:[code]:py-[0.2rem] **:[code]:font-mono **:[p]:leading-relaxed **:[p]:not-first:mt-3 **:[strong,a]:font-medium **:[strong,a]:text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: markdownToSafeHTML(aiState.response),
                          }}
                        />
                        {aiState.referenceLinks.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {aiState.referenceLinks.map((link, index) => (
                              <Button
                                key={`${link.url}-${index}`}
                                render={<Link href={link.url} />}
                                size="sm"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                              >
                                {link.title}
                              </Button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CommandPanel>

              <CommandFooter>
                {aiState.isGenerating ? (
                  <div aria-live="polite" className="flex items-center gap-2">
                    <div className="flex h-5 items-center justify-center">
                      <Spinner className="size-3" />
                    </div>
                    <span className="animate-pulse">Generating response…</span>
                  </div>
                ) : aiState.response ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 items-center justify-center">
                      <CircleQuestionMarkIcon className="size-3" />
                    </div>
                    You asked: <span>&quot;{aiState.submittedQuery}&quot;</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Kbd>
                      <CornerDownLeftIcon />
                    </Kbd>
                    <span>Ask AI</span>
                  </div>
                )}
              </CommandFooter>
            </Command>
          )}
        </CommandDialogPopup>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
