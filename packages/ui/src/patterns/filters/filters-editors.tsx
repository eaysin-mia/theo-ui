"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "theo-ui/components/combobox";
import { Button } from "theo-ui/components/button";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";
import {
  FilterActionsContext,
  filterControlSizes,
  type FilterResolutionStore,
} from "theo-ui/patterns/filters/filters-context";
import {
  applyFilterExclusiveSelection,
  filterFilterOptions,
  joinFilterPath,
  normalizeFilterQuery,
  warnFilterOnce,
} from "theo-ui/patterns/filters/filters-lib";
import type {
  AnyFilterEditor,
  FilterEditorProps,
  FilterEditorRegistry,
  FilterField,
  FilterIndex,
  FilterLabels,
  FilterLoadResult,
  FilterOperator,
  FilterOption,
  FilterOptionsState,
} from "theo-ui/patterns/filters/filters-types";

import { cn } from "theo-ui/lib/utils";
import { Field } from "theo-ui/components/field";
import { Form } from "theo-ui/components/form";
import { Textarea } from "theo-ui/components/textarea";
import { PopoverDescription, PopoverTitle } from "theo-ui/components/popover";
import { Group, GroupSeparator, GroupText } from "theo-ui/components/group";
import { Input } from "theo-ui/components/input";
import { Calendar } from "theo-ui/components/calendar";
import type { DateRange } from "@daypicker/react";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import {
  type FilterDateValue,
  isFilterDateValue,
  resolveFilterDate,
  toFilterDateValue,
  RELATIVE_TODAY,
  RELATIVE_TOMORROW,
  RELATIVE_YESTERDAY,
} from "theo-ui/patterns/filters/filters-date";

/* -------------------------------------------------------------------------- */
/*                              The options service                           */
/* -------------------------------------------------------------------------- */

interface OptionsInternalState<O> {
  items: FilterOption<O>[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  cursor?: string;
}

const IDLE: OptionsInternalState<never> = {
  items: [],
  loading: false,
  error: false,
  hasMore: false,
};

/** Stable no-op subscription, for a hook running outside a `Filters` root. */
const emptySubscribe = () => () => {};
const zeroVersion = () => 0;

/**
 * The joined path of a field, from the schema index. Keyed by PATH, not field
 * identity, so labels survive a schema rebuild; an unknown field uses its id.
 */
function filterFieldKey<V, O>(
  field: FilterField<V, O> | undefined,
  index: FilterIndex | undefined,
): string | null {
  if (!field) return null;
  if (index) {
    for (const entry of index.all) {
      if (entry.field.id === field.id) {
        return joinFilterPath(entry.path);
      }
    }
  }
  return `#${field.id}`;
}

/**
 * The shared option service every option-backed editor receives: debouncing,
 * aborting, cursor paging and value-to-label resolution. A deliberate fork of
 * the cascader's async machinery. Resolution is two-tier: a ref cache written
 * in an EFFECT, plus the root's `FilterResolutionStore`, without which a
 * `loadOptions`-only field showed its raw id once the menu closed.
 */
export function useFilterOptions<V, O>(
  field: FilterField<V, O> | undefined,
  enabled: boolean,
  debounceMs = 250,
): FilterOptionsState<O> {
  const [query, setQueryState] = React.useState("");
  const [state, setState] = React.useState<OptionsInternalState<O>>(
    IDLE as OptionsInternalState<O>,
  );

  const cache = React.useRef(new Map<string, FilterOption<O>>());
  const requestId = React.useRef(0);
  const abortRef = React.useRef<AbortController | null>(null);

  // Read directly, so this degrades outside a `Filters` root instead of throwing.
  const actionsContext = React.useContext(FilterActionsContext);
  const shared: FilterResolutionStore | null =
    actionsContext?.resolution ?? null;
  const sharedKey = filterFieldKey(field, actionsContext?.index);

  // Re-render when a label lands ANYWHERE under this root, not just here.
  React.useSyncExternalStore(
    shared ? shared.subscribe : emptySubscribe,
    shared ? shared.getVersion : zeroVersion,
    shared ? shared.getVersion : zeroVersion,
  );

  const staticOptions = field?.options;
  const loadOptions = field?.loadOptions;
  const isAsync = Boolean(loadOptions);

  // Seeded in an effect, not during render, so the render stays pure.
  React.useEffect(() => {
    if (!staticOptions) return;
    for (const option of staticOptions) cache.current.set(option.value, option);
    if (shared && sharedKey) shared.set(sharedKey, staticOptions);
  }, [staticOptions, shared, sharedKey]);

  React.useEffect(() => {
    for (const option of state.items) cache.current.set(option.value, option);
    if (shared && sharedKey && state.items.length) {
      shared.set(sharedKey, state.items);
    }
  }, [state.items, shared, sharedKey]);

  const run = React.useCallback(
    async (nextQuery: string, cursor: string | undefined, append: boolean) => {
      if (!loadOptions) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const id = ++requestId.current;

      setState((previous) => ({
        ...previous,
        loading: true,
        error: false,
        items: append ? previous.items : [],
      }));

      try {
        const result = await loadOptions(nextQuery, {
          signal: controller.signal,
          cursor,
        });
        // A superseded request must not write; the id, not the abort, decides.
        if (id !== requestId.current) return;

        const normalized: FilterLoadResult<O> = Array.isArray(result)
          ? { items: result }
          : result;

        setState((previous) => ({
          items: append
            ? [...previous.items, ...normalized.items]
            : normalized.items,
          loading: false,
          error: false,
          hasMore: normalized.hasMore ?? Boolean(normalized.nextCursor),
          cursor: normalized.nextCursor,
        }));
      } catch (error) {
        if (id !== requestId.current) return;
        if (
          (error instanceof Error || error instanceof DOMException) &&
          error.name === "AbortError"
        ) {
          return;
        }
        setState((previous) => ({
          ...previous,
          loading: false,
          error: true,
          hasMore: false,
        }));
      }
    },
    [loadOptions],
  );

  React.useEffect(() => {
    if (!enabled || !isAsync) return;
    const timer = setTimeout(
      () => void run(query, undefined, false),
      debounceMs,
    );
    return () => clearTimeout(timer);
  }, [enabled, isAsync, query, debounceMs, run]);

  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const normalizedQuery = normalizeFilterQuery(query);

  // Async results are server-filtered; re-filtering hides what the label omits.
  const items = React.useMemo(() => {
    if (isAsync) return state.items;
    return filterFilterOptions(staticOptions ?? [], normalizedQuery);
  }, [isAsync, state.items, staticOptions, normalizedQuery]);

  const setQuery = React.useCallback((next: string) => setQueryState(next), []);

  const loadMore = React.useCallback(() => {
    if (!state.hasMore || state.loading) return;
    void run(query, state.cursor, true);
  }, [state.hasMore, state.loading, state.cursor, query, run]);

  const retry = React.useCallback(() => {
    void run(query, undefined, false);
  }, [query, run]);

  const resolve = React.useCallback(
    (value: string) => {
      // The ref cache cannot be the only tier: a ref write triggers no render,
      // so the chip would paint the raw value and never repaint. The shared
      // store holds other instances' pages and re-renders this one on a gain.
      const declared = staticOptions?.find((option) => option.value === value);
      if (declared) return declared;
      const fromShared =
        shared && sharedKey ? shared.get(sharedKey, value) : undefined;
      if (fromShared) return fromShared as FilterOption<O>;
      return cache.current.get(value);
    },
    [staticOptions, shared, sharedKey],
  );

  return {
    items,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    query,
    setQuery,
    loadMore,
    retry,
    resolve,
  };
}

/**
 * Resolves committed values no loaded page covered, through `resolveValues`: a
 * restored saved view holds ids the loader never returned. The claim set marks
 * an omitted id asked, so only a REJECTED resolve lets a later mount retry.
 */
export function useFilterValueResolution<V, O>(
  field: FilterField<V, O> | undefined,
  values: readonly unknown[],
): void {
  const actionsContext = React.useContext(FilterActionsContext);
  const shared: FilterResolutionStore | null =
    actionsContext?.resolution ?? null;
  const sharedKey = filterFieldKey(field, actionsContext?.index);
  const resolveValues = field?.resolveValues;
  const staticOptions = field?.options;
  // Keyed by CONTENT; NUL cannot occur inside a real stored value.
  const valuesKey = values.map((entry) => String(entry)).join("\u0000");

  React.useEffect(() => {
    if (!resolveValues || !shared || !sharedKey || valuesKey === "") return;
    const missing = valuesKey.split("\u0000").filter((value) => {
      if (staticOptions?.some((option) => option.value === value)) return false;
      return shared.get(sharedKey, value) === undefined;
    });
    const wanted = shared.claim(sharedKey, missing);
    if (wanted.length === 0) return;

    // No unmount guard: the store outlives the component.
    void Promise.resolve(resolveValues(wanted)).then(
      (options) => shared.set(sharedKey, options),
      () => shared.release(sharedKey, wanted),
    );
  }, [resolveValues, shared, sharedKey, valuesKey, staticOptions]);
}

/* -------------------------------------------------------------------------- */
/*                               Shared chrome                                */
/* -------------------------------------------------------------------------- */

/**
 * The panel every editor renders into. A plain flex column, NOT a combobox: an
 * editor inside a Base UI composite would inherit its `aria-activedescendant`
 * and arrow keys, which is hostile to a colour picker or a slider.
 */
function EditorPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="filter-editor"
      className={cn("flex w-full flex-col gap-2 p-2", className)}
    >
      {children}
    </div>
  );
}

function EditorFooter({
  onCancel,
  onCommit,
  labels,
  host,
}: Pick<FilterEditorProps, "labels" | "host"> & {
  onCancel: () => void;
  onCommit: () => void;
}) {
  // The ONE ladder, not a hardcoded rung: `size="sm"` here measured 4px short
  // of the bar's own controls at `size="default"` in all eight styles.
  const actions = React.useContext(FilterActionsContext);
  const sizes = filterControlSizes({ size: actions?.size ?? "default" });

  // The create host advances on commit and has Back; amend must offer discard.
  if (host === "create") return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-1">
      <Button variant="ghost" size={sizes.button} onClick={onCancel}>
        {labels.discard}
      </Button>
      <Button size={sizes.button} onClick={onCommit}>
        {labels.apply}
      </Button>
    </div>
  );
}

/**
 * `w-full` because `Group` is `w-fit`, which collapses inside this
 * fixed-width panel. Sera is an underline style, so its direct children flatten
 * to one bottom-only edge - `border-b-input`, not transparent, since the
 * buttons are the trailing edge and the rule would stop mid-panel.
 */
const EDITOR_FIELD_GROUP = "w-full";

/**
 * Confirm and cancel, an OUTLINE pair FUSED onto the field's trailing edge.
 * Returns a FRAGMENT: `Group` fuses with selectors matching DIRECT
 * children only, so a wrapper div renders three separate boxes. `size="icon"`
 * because every style's icon button at that size is exactly its input's height.
 */
function EditorCommitButtons({
  onCancel,
  onCommit,
  labels,
}: Pick<FilterEditorProps, "labels"> & {
  onCancel: () => void;
  onCommit: () => void;
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={labels.apply}
        onClick={onCommit}
      >
        <CheckIcon aria-hidden="true" />
      </Button>
      <GroupSeparator />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={labels.discard}
        onClick={onCancel}
      >
        <XIcon aria-hidden="true" />
      </Button>
    </>
  );
}

function useCommitKeys(commit: () => void, cancel: () => void) {
  return React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
        event.preventDefault();
        commit();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        // Stop here so a surrounding dialog does not also close.
        event.stopPropagation();
        cancel();
      }
    },
    [commit, cancel],
  );
}

/* -------------------------------------------------------------------------- */
/*                                Text / number                               */
/* -------------------------------------------------------------------------- */

export function FilterTextEditor<V, O>({
  value,
  onValueChange,
  commit,
  cancel,
  autoFocusProps,
  labels,
  host,
  field,
}: FilterEditorProps<V, O>) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    commit();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      cancel();
    }
  };

  return (
    <div
      data-slot="filter-editor"
      className={cn(
        "flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2.5 p-2.5",
        field.className,
      )}
    >
      {field.description ? (
        <PopoverDescription className="text-xs text-muted-foreground">
          {field.description}
        </PopoverDescription>
      ) : null}

      <Form className="flex w-full flex-col gap-2.5" onSubmit={handleSubmit}>
        <Field className="w-full">
          <Textarea
            ref={autoFocusProps.ref as React.Ref<HTMLTextAreaElement>}
            autoFocus={autoFocusProps.autoFocus}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder ?? labels.valuePlaceholder}
            aria-label={field.label}
            onChange={(event) => onValueChange(event.target.value as V)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="resize-none"
          />
        </Field>
        <div className="flex items-center justify-end gap-1.5">
          {host !== "create" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancel}
              className="font-normal"
            >
              {labels.discard}
            </Button>
          )}
          <Button type="submit" size="sm" className="font-normal">
            {labels.apply}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export function FilterNumberEditor<V, O>({
  value,
  onValueChange,
  commit,
  cancel,
  autoFocusProps,
  labels,
  host,
  field,
}: FilterEditorProps<V, O>) {
  const onKeyDown = useCommitKeys(() => commit(), cancel);
  return (
    // Deliberately not the text editor's `w-72`: number values are short by
    // construction, and a wide box around "42" is the opposite defect.
    <EditorPanel className={cn("w-56 min-w-0", field.className)}>
      <Group className={EDITOR_FIELD_GROUP}>
        <Input
          {...autoFocusProps}
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          placeholder={field.placeholder}
          aria-label={field.label}
          onChange={(event) => {
            const raw = event.target.value;
            onValueChange((raw === "" ? undefined : Number(raw)) as V);
          }}
          onKeyDown={onKeyDown}
        />
        {host === "create" ? null : (
          <>
            <GroupSeparator />
            <EditorCommitButtons
              labels={labels}
              onCancel={cancel}
              onCommit={() => commit()}
            />
          </>
        )}
      </Group>
    </EditorPanel>
  );
}

export function FilterRangeEditor<V, O>({
  value,
  onValueChange,
  commit,
  cancel,
  autoFocusProps,
  labels,
  host,
  field,
}: FilterEditorProps<V, O>) {
  const tuple = Array.isArray(value) ? value : [];
  const onKeyDown = useCommitKeys(() => commit(), cancel);

  const update = (index: 0 | 1, raw: string) => {
    const next = [tuple[0], tuple[1]];
    if (raw === "") {
      next[index] = undefined;
    } else {
      const num = Number(raw);
      next[index] = Number.isNaN(num) ? undefined : num;
    }
    onValueChange(next as V);
  };

  return (
    <EditorPanel className={cn("w-60 min-w-0", field.className)}>
      <Group className="w-full">
        <Input
          {...autoFocusProps}
          type="number"
          value={tuple[0] === undefined ? "" : String(tuple[0])}
          aria-label={labels.rangeFrom(field.label)}
          onChange={(event) => update(0, event.target.value)}
          onKeyDown={onKeyDown}
        />
        <GroupSeparator />
        <GroupText>{labels.rangeSeparator}</GroupText>
        <GroupSeparator />
        <Input
          type="number"
          value={tuple[1] === undefined ? "" : String(tuple[1])}
          aria-label={labels.rangeTo(field.label)}
          onChange={(event) => update(1, event.target.value)}
          onKeyDown={onKeyDown}
        />
      </Group>
      <EditorFooter
        host={host}
        labels={labels}
        onCancel={cancel}
        onCommit={() => commit()}
      />
    </EditorPanel>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  The menu                                  */
/* -------------------------------------------------------------------------- */

/** One row. The shape both the operator menu and the option editors hand over. */
export interface FilterListItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  keywords?: string[];
  disabled?: boolean;
  /**
   * A None row, from `FilterOption.exclusive`. LAYOUT only: what a pick DOES is
   * `applyFilterExclusiveSelection`, in the option editor's handler. A consumer
   * composing `FilterMenu` into an editor of their own owns the same call.
   */
  exclusive?: boolean;
}

/**
 * Menu item grouping and selection props.
 */
export interface FilterMenuProps {
  items: FilterListItem[];
  /** Committed values. Drives the check mark and the pinned group. */
  selected: string[];
  multiple?: boolean;
  /** Receives the FULL next selection, so no caller re-derives it. */
  onSelectionChange: (values: string[]) => void;
  labels: FilterLabels;
  ariaLabel: string;
  searchPlaceholder?: string;
  /** Whether the search field is VISIBLE. */
  searchable?: boolean;
  maxHeight?: number;
  pinSelected?: boolean;
  sortSelected?: "none" | "label" | "snapshot";
  preFiltered?: boolean;
  autoFocusProps?: FilterEditorProps["autoFocusProps"];
  query?: string;
  onQueryChange?: (query: string) => void;
  state?: Pick<
    FilterOptionsState<unknown>,
    "loading" | "error" | "hasMore" | "loadMore" | "retry"
  >;
}

export function FilterMenu({
  items,
  selected,
  multiple = false,
  onSelectionChange,
  labels,
  ariaLabel,
  searchPlaceholder,
  searchable = true,
  maxHeight = 240,
  pinSelected = false,
  sortSelected = "none",
  preFiltered = false,
  autoFocusProps,
  query,
  onQueryChange,
  state,
}: FilterMenuProps) {
  const [ownQuery, setOwnQuery] = React.useState("");
  const currentQuery = query ?? ownQuery;
  const setQuery = onQueryChange ?? setOwnQuery;

  const filteredItems = React.useMemo(() => {
    if (preFiltered || !currentQuery.trim()) {
      return items;
    }
    const q = currentQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }, [items, currentQuery, preFiltered]);

  const regularItems = React.useMemo(() => {
    const list = filteredItems.filter((i) => !i.exclusive);
    if (sortSelected === "label") {
      return [...list].sort((a, b) => a.label.localeCompare(b.label));
    }
    return list;
  }, [filteredItems, sortSelected]);

  const exclusiveItems = React.useMemo(() => {
    return filteredItems.filter((i) => i.exclusive);
  }, [filteredItems]);

  const handleSelect = (itemValue: string) => {
    if (multiple) {
      if (selected.includes(itemValue)) {
        onSelectionChange(selected.filter((v) => v !== itemValue));
      } else {
        onSelectionChange([...selected, itemValue]);
      }
    } else {
      if (selected.includes(itemValue)) {
        onSelectionChange([]);
      } else {
        onSelectionChange([itemValue]);
      }
    }
  };

  const innerContent = (
    <div className="flex w-full flex-col text-sm">
      {searchable && (
        <div className="border-b p-2">
          <ComboboxInput
            {...(autoFocusProps ?? {})}
            className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
            placeholder={searchPlaceholder ?? labels.searchOptions}
            aria-label={ariaLabel}
            showTrigger={false}
            startAddon={<SearchIcon />}
            value={currentQuery}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <ComboboxEmpty className="py-6 text-center text-xs text-muted-foreground">
          {state?.error
            ? labels.error
            : state?.loading
              ? labels.loading
              : labels.empty}
        </ComboboxEmpty>
      ) : (
        <div className="max-h-60 min-h-0 flex-1 overflow-hidden">
          <ComboboxList className="max-h-60">
            {regularItems.map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                onClick={() => handleSelect(item.value)}
                className="cursor-pointer py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {item.icon && (
                    <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground">
                      {item.icon}
                    </span>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-start">{item.label}</span>
                    {item.description && (
                      <span className="truncate text-start text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </ComboboxItem>
            ))}

            {exclusiveItems.length > 0 && regularItems.length > 0 && (
              <ComboboxSeparator className="my-1" />
            )}

            {exclusiveItems.map((item) => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                onClick={() => handleSelect(item.value)}
                className="cursor-pointer py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {item.icon && (
                    <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground">
                      {item.icon}
                    </span>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-start">{item.label}</span>
                    {item.description && (
                      <span className="truncate text-start text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </div>
      )}

      {(state?.hasMore || state?.error) && (
        <div className="border-t border-border p-1">
          {state.error ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={state.retry}
            >
              {labels.retry}
            </Button>
          ) : state.hasMore ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={state.loading}
              className="w-full justify-center text-xs"
              onClick={state.loadMore}
            >
              {state.loading ? labels.loadingMore : labels.loadMore}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );

  return multiple ? (
    <Combobox
      multiple
      items={filteredItems}
      value={selected}
      onValueChange={() => {}}
    >
      {innerContent}
    </Combobox>
  ) : (
    <Combobox
      items={filteredItems}
      value={selected[0] ?? null}
      onValueChange={() => {}}
    >
      {innerContent}
    </Combobox>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Option based editors                          */
/* -------------------------------------------------------------------------- */

function OptionEditor<V, O>(
  props: FilterEditorProps<V, O> & { multiple: boolean },
) {
  const {
    multiple,
    options,
    labels,
    autoFocusProps,
    commit,
    cancel,
    onValueChange,
    value,
    field,
  } = props;

  const selected = React.useMemo(() => {
    if (value === undefined || value === null) return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(String);
  }, [value]);

  const announce = React.useContext(FilterActionsContext)?.announce;

  return (
    /*
      A DELIBERATELY narrow default: 12rem holds around 22 characters at every
      style's row size. `field.className` lands LAST, so a consumer's `w-*` wins.
    */
    <EditorPanel
      className={cn("w-auto max-w-64 min-w-44 gap-0 p-0", field.className)}
    >
      <FilterMenu
        items={options.items}
        selected={selected}
        multiple={multiple}
        onSelectionChange={(raw) => {
          /*
            The ONE place the None rule is applied: every route into a selection
            arrives here, so click and keyboard cannot disagree, and only the
            editor can ANSWER it - `options.resolve` sees the schema and every
            loaded page, where the menu holds only the rows on screen.
          */
          const values = applyFilterExclusiveSelection(raw, selected, (value) =>
            Boolean(options.resolve(value)?.exclusive),
          );

          /*
            Identity is the test: the rule hands back `raw` itself unless it
            intervened. Announced because nothing else reports it: focus never
            moved, and nobody is on the rows that lost their check marks.
          */
          if (values !== raw && announce) {
            const arrived = values.find((entry) => !selected.includes(entry));
            const cleared = raw.length - values.length;
            if (arrived !== undefined && cleared > 0) {
              announce(
                labels.exclusiveAnnouncement(
                  options.resolve(arrived)?.label ?? arrived,
                  cleared,
                ),
              );
            }
          } else if (values === raw && raw.length > 1) {
            /*
              The hole in the rule, made LOUD. An unresolvable value is treated
              as ordinary and cannot be told from an id whose label has not
              arrived, so this warns rather than acts. Needs a SEEN None row.
            */
            const hasNoneRow =
              options.items.some((item) => item.exclusive) ||
              Boolean(field.options?.some((option) => option.exclusive));
            const unresolved = hasNoneRow
              ? raw.find((entry) => options.resolve(entry) === undefined)
              : undefined;
            if (unresolved !== undefined) {
              warnFilterOnce(
                `exclusive-unresolved:${field.id}`,
                `field "${field.id}" has an exclusive option, but the value ` +
                  `"${unresolved}" resolves to no option, so the None rule ` +
                  `cannot tell whether it is the exclusive one and has left ` +
                  `it in place. Declare the exclusive option in the field's ` +
                  `\`options\` even when the rest of the list is async, or ` +
                  `cover stored values with \`resolveValues\`.`,
              );
            }
          }

          if (!multiple) {
            const next = values[0];
            // Base UI deselects the committed row; an empty filter is no gain.
            if (next === undefined) {
              cancel();
              return;
            }
            onValueChange(next as V);
            commit(next as V);
            return;
          }
          onValueChange(values as V);
          // Every toggle commits with the popover open: several picks, one gesture.
          commit(values as V, { close: false });
        }}
        labels={labels}
        ariaLabel={field.label}
        searchable={field.searchable ?? true}
        // Not a composed `Search ${label}...`: hardcoded English no `labels`
        // override could reach, and lowercasing a label is locale-hostile.
        searchPlaceholder={field.placeholder}
        pinSelected={field.pinSelected ?? false}
        sortSelected={field.sortSelected}
        // `useFilterOptions` already applied the query, locally or server side.
        preFiltered
        query={options.query}
        onQueryChange={options.setQuery}
        state={options}
        autoFocusProps={autoFocusProps}
      />
    </EditorPanel>
  );
}

export function FilterSelectEditor<V, O>(props: FilterEditorProps<V, O>) {
  return <OptionEditor {...props} multiple={false} />;
}

export function FilterMultiSelectEditor<V, O>(props: FilterEditorProps<V, O>) {
  return <OptionEditor {...props} multiple />;
}

/* -------------------------------------------------------------------------- */
/*                                   Boolean                                  */
/* -------------------------------------------------------------------------- */

/**
 * Module level, so the menu's index is not rebuilt on every render. Not in
 * `FilterLabels`: the chip's own display spells the same two words out.
 */
const BOOLEAN_ITEMS: FilterListItem[] = [
  { value: "true", label: "True" },
  { value: "false", label: "False" },
];

export function FilterBooleanEditor<V, O>({
  value,
  onValueChange,
  commit,
  labels,
  autoFocusProps,
  field,
}: FilterEditorProps<V, O>) {
  return (
    // Two words, and `field.className` lands last so a consumer's `w-*` wins.
    <EditorPanel className={cn("w-40 min-w-0 gap-0 p-0", field.className)}>
      <FilterMenu
        items={BOOLEAN_ITEMS}
        selected={value === true ? ["true"] : value === false ? ["false"] : []}
        onSelectionChange={(values) => {
          /* Deselecting the committed row leaves nothing to filter on, so it is
             a no-op rather than a commit of `false`. */
          if (values.length === 0) return;
          const next = (values[0] === "true") as V;
          onValueChange(next);
          commit(next);
        }}
        labels={labels}
        ariaLabel={field.label}
        /* Two rows: a search over them is more chrome than list, but the
           field is still rendered, hidden, because it owns the keyboard. */
        searchable={false}
        autoFocusProps={autoFocusProps}
      />
    </EditorPanel>
  );
}

export function FilterDateEditor<V, O>({
  value,
  onValueChange,
  commit,
}: FilterEditorProps<V, O>) {
  const rawValue: unknown = value;
  const dateValue = isFilterDateValue(rawValue) ? rawValue : undefined;
  const currentDate = React.useMemo(() => {
    return resolveFilterDate(dateValue) ?? undefined;
  }, [dateValue?.date, dateValue?.relative?.unit, dateValue?.relative?.offset]);

  const [month, setMonth] = React.useState<Date>(currentDate ?? new Date());

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      onValueChange(undefined);
      commit(undefined);
      return;
    }
    const nextVal = toFilterDateValue(date);
    onValueChange(nextVal as V);
    commit(nextVal as V);
  };

  const handleSelectPreset = (relative: typeof RELATIVE_TODAY) => {
    const nextVal: FilterDateValue = { relative };
    onValueChange(nextVal as V);
    commit(nextVal as V);
  };

  return (
    <div data-slot="filter-editor" className="flex flex-col sm:flex-row">
      <div className="flex gap-1 border-b p-1 sm:flex-col sm:border-e sm:border-b-0 sm:pe-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 justify-start text-xs"
          onClick={() => handleSelectPreset(RELATIVE_TODAY)}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 justify-start text-xs"
          onClick={() => handleSelectPreset(RELATIVE_YESTERDAY)}
        >
          Yesterday
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 justify-start text-xs"
          onClick={() => handleSelectPreset(RELATIVE_TOMORROW)}
        >
          Tomorrow
        </Button>
      </div>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={currentDate}
        onSelect={handleSelectDate}
        autoFocus
      />
    </div>
  );
}

export function FilterDateRangeEditor<V, O>({
  value,
  onValueChange,
  commit,
  cancel,
  labels,
  host,
  field,
}: FilterEditorProps<V, O>) {
  const today = React.useMemo(() => new Date(), []);

  const presets = React.useMemo(() => {
    return [
      {
        label: "Today",
        range: { from: today, to: today },
      },
      {
        label: "Yesterday",
        range: { from: subDays(today, 1), to: subDays(today, 1) },
      },
      {
        label: "Last 7 days",
        range: { from: subDays(today, 6), to: today },
      },
      {
        label: "Last 30 days",
        range: { from: subDays(today, 29), to: today },
      },
      {
        label: "Month to date",
        range: { from: startOfMonth(today), to: today },
      },
      {
        label: "Last month",
        range: {
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1)),
        },
      },
      {
        label: "Year to date",
        range: { from: startOfYear(today), to: today },
      },
      {
        label: "Last year",
        range: {
          from: startOfYear(subYears(today, 1)),
          to: endOfYear(subYears(today, 1)),
        },
      },
    ];
  }, [today]);

  const tuple = Array.isArray(value) ? value : [];

  const fromDate = React.useMemo(() => {
    const from = tuple[0];
    return isFilterDateValue(from)
      ? (resolveFilterDate(from) ?? undefined)
      : undefined;
  }, [tuple[0]]);

  const toDate = React.useMemo(() => {
    const to = tuple[1];
    return isFilterDateValue(to)
      ? (resolveFilterDate(to) ?? undefined)
      : undefined;
  }, [tuple[1]]);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      if (!fromDate && !toDate) return undefined;
      return { from: fromDate, to: toDate };
    },
  );

  const [month, setMonth] = React.useState<Date>(() => fromDate ?? today);

  React.useEffect(() => {
    if (fromDate || toDate) {
      setDateRange({ from: fromDate, to: toDate });
      if (fromDate) setMonth(fromDate);
    } else {
      setDateRange(undefined);
    }
  }, [fromDate, toDate]);

  const handleSelectRange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (!range) {
      onValueChange(undefined);
      return;
    }
    const fromVal = range.from ? toFilterDateValue(range.from) : undefined;
    const toVal = range.to ? toFilterDateValue(range.to) : fromVal;
    onValueChange([fromVal, toVal] as V);
  };

  const handleSelectPreset = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setMonth(range.to);
    const fromVal = toFilterDateValue(range.from);
    const toVal = toFilterDateValue(range.to);
    onValueChange([fromVal, toVal] as V);
  };

  const handleCommit = () => {
    if (dateRange?.from) {
      const fromVal = toFilterDateValue(dateRange.from);
      const toVal = dateRange.to ? toFilterDateValue(dateRange.to) : fromVal;
      const nextVal = [fromVal, toVal] as V;
      onValueChange(nextVal);
      commit(nextVal);
    } else {
      onValueChange(undefined);
      commit(undefined);
    }
  };

  return (
    <div
      data-slot="filter-editor"
      className={cn("flex flex-col gap-2 p-2", field.className)}
    >
      <div className="flex max-sm:flex-col">
        <div className="relative py-1 ps-1 max-sm:order-1 max-sm:border-t">
          <div className="flex h-full flex-col sm:border-e sm:pe-3">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="h-7 w-full justify-start text-xs font-normal"
                onClick={() => handleSelectPreset(preset.range)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <Calendar
          className="max-sm:pb-3 sm:ps-5"
          mode="range"
          month={month}
          onMonthChange={setMonth}
          selected={dateRange}
          onSelect={handleSelectRange}
          autoFocus
        />
      </div>
      <EditorFooter
        host={host}
        labels={labels}
        onCancel={cancel}
        onCommit={handleCommit}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Resolution                                */
/* -------------------------------------------------------------------------- */

export type {
  AnyFilterEditor,
  FilterEditorRegistry,
} from "theo-ui/patterns/filters/filters-types";

export const DEFAULT_FILTER_EDITORS: FilterEditorRegistry = {
  text: FilterTextEditor,
  number: FilterNumberEditor,
  range: FilterRangeEditor,
  select: FilterSelectEditor,
  multiselect: FilterMultiSelectEditor,
  boolean: FilterBooleanEditor,
  date: FilterDateEditor,
  date_range: FilterDateRangeEditor,
};

/**
 * Picks the editor for a (field, operator) pair: the field's own `editor`, then
 * the operator's ARITY, then the field's `type`. Arity outranks type because
 * "between" wants two boxes whatever the field said.
 */
export function resolveFilterEditor<V, O>(
  field: FilterField<V, O>,
  operator: FilterOperator | undefined,
  editors: FilterEditorRegistry,
): AnyFilterEditor | undefined {
  if (typeof field.editor === "function") {
    // The consumer's typed editor component
    return field.editor as AnyFilterEditor;
  }
  if (typeof field.editor === "string") {
    const named = editors[field.editor];
    if (named) return named;
  }

  const arity = operator?.arity ?? "one";
  if (arity === "none") return undefined;
  if (arity === "range") {
    if (field.type === "date_range") return editors.date_range ?? editors.range;
    return editors.range;
  }
  if (arity === "many") {
    // An option-backed field gets checkboxes; anything else receives an array.
    if (field.options || field.loadOptions) return editors.multiselect;
  }

  return editors[field.type ?? "text"] ?? editors.text;
}
