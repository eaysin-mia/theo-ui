"use client";

import * as React from "react";
import {
  filterControlSizes,
  filterReadOnlyProps,
  useFilterActions,
  useFilterFocusStore,
  useFilterState,
} from "#components/filters/filters-context";
import {
  FILTER_FIELD_PICKER_CLASS,
  getFilterField,
  getFilterFieldChain,
  getFilterFieldCount,
  joinFilterPath,
} from "#components/filters/filters-lib";
import { getDefaultFilterOperator } from "#components/filters/filters-operators";
import { isFilterRule } from "#components/filters/filters-query";
import type {
  FilterField,
  FilterNode,
} from "#components/filters/filters-types";

import { cn } from "#lib/utils";
import { Button } from "#components/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#components/breadcrumb";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "#components/combobox";
import { Popover, PopoverPopup, PopoverTrigger } from "#components/popover";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterPlusIcon,
  SearchIcon,
} from "lucide-react";

export interface FilterFieldPickerProps {
  /** The level being browsed. Not the chosen field. */
  path: string[];
  onPathChange: (path: string[]) => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** A field was chosen, with its starting operator already resolved. */
  onSelect: (path: string[], defaultOperator: string | null) => void;
  /** Viewport height before the list scrolls. */
  maxHeight?: number;
  labels?: Record<string, unknown>;
  actions?: unknown[];
}

/**
 * Fully controlled native Coss UI Combobox field picker.
 */
export function FilterFieldPicker<V, O>({
  path,
  onPathChange,
  query,
  onQueryChange,
  onSelect,
  maxHeight = 260,
}: FilterFieldPickerProps) {
  const actions = useFilterActions<V, O>();
  const state = useFilterState<V>();

  const activePaths = React.useMemo(() => {
    const set = new Set<string>();
    const walk = (node: FilterNode<V>) => {
      if (isFilterRule(node)) {
        set.add(node.path.join("\u0000"));
        return;
      }
      for (const child of node.rules) walk(child);
    };
    walk(state.query);
    return set;
  }, [state.query]);

  const currentParent = React.useMemo(() => {
    if (path.length === 0) return null;
    return getFilterField(actions.index, path);
  }, [actions.index, path]);

  const items = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      const matches: Array<{
        path: string[];
        field: FilterField<V, O>;
        label: string;
      }> = [];
      const search = (
        fields: readonly FilterField<V, O>[],
        curPath: string[],
      ) => {
        for (const f of fields) {
          const nextP = [...curPath, f.id];
          if (f.fields?.length) {
            search(f.fields, nextP);
          } else {
            const match =
              f.label.toLowerCase().includes(trimmed) ||
              f.keywords?.some((k) => k.toLowerCase().includes(trimmed));
            if (match) {
              matches.push({
                path: nextP,
                field: f,
                label:
                  nextP.length > 1
                    ? nextP
                        .map(
                          (seg, i) =>
                            getFilterField(actions.index, nextP.slice(0, i + 1))
                              ?.label ?? seg,
                        )
                        .join(" / ")
                    : f.label,
              });
            }
          }
        }
      };
      search(actions.index.roots, []);
      return matches;
    }

    const currentFields = currentParent?.fields ?? actions.index.roots;
    return currentFields.map((f) => ({
      path: [...path, f.id],
      field: f,
      label: f.label,
    }));
  }, [actions.index, path, currentParent, query]);

  const chain = React.useMemo(
    () => getFilterFieldChain(actions.index, path),
    [actions.index, path],
  );

  return (
    <Combobox value={null} onValueChange={() => {}}>
      <div className="flex w-full flex-col">
        <div className="border-b p-2">
          <ComboboxInput
            className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
            placeholder={actions.labels.searchFields}
            showTrigger={false}
            startAddon={<SearchIcon />}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
          />
        </div>

        {path.length > 0 && !query.trim() && (
          <div className="flex items-center gap-1.5 border-b px-2.5 py-1.5 text-xs text-muted-foreground">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => onPathChange(path.slice(0, -1))}
              className="size-5 shrink-0"
              aria-label={actions.labels.back}
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <Breadcrumb className="min-w-0 flex-1">
              <BreadcrumbList className="flex-nowrap gap-1 overflow-hidden text-xs sm:gap-1">
                <BreadcrumbItem className="shrink-0">
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-normal text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => onPathChange([])}
                  >
                    {actions.labels.fieldsLabel}
                  </button>
                </BreadcrumbItem>
                {chain.map((f, index) => {
                  const isLast = index === chain.length - 1;
                  const fieldPath = path.slice(0, index + 1);
                  return (
                    <React.Fragment key={f.id}>
                      <BreadcrumbSeparator className="opacity-60 [&>svg]:size-3" />
                      <BreadcrumbItem className="min-w-0">
                        {isLast ? (
                          <BreadcrumbPage className="truncate font-medium text-foreground">
                            {f.label}
                          </BreadcrumbPage>
                        ) : (
                          <button
                            type="button"
                            className="cursor-pointer truncate text-xs font-normal text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => onPathChange(fieldPath)}
                          >
                            {f.label}
                          </button>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {items.length === 0 ? (
          <ComboboxEmpty className="py-6 text-center text-xs text-muted-foreground">
            {actions.labels.empty}
          </ComboboxEmpty>
        ) : (
          <ComboboxList className="max-h-64">
            {items.map((item) => {
              const hasChildren = Boolean(item.field.fields?.length);
              const count = hasChildren
                ? getFilterFieldCount(item.field)
                : undefined;
              const isAlreadyAdded = activePaths.has(item.path.join("\u0000"));
              return (
                <ComboboxItem
                  key={joinFilterPath(item.path)}
                  value={joinFilterPath(item.path)}
                  onClick={() => {
                    if (hasChildren && !query.trim()) {
                      onPathChange(item.path);
                    } else {
                      onSelect(
                        item.path,
                        getDefaultFilterOperator(
                          item.field,
                          actions.resolveOperators(item.field),
                        ),
                      );
                    }
                  }}
                  className="cursor-pointer py-1.5"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {item.field.icon && (
                        <span className="size-4 shrink-0 text-muted-foreground [&_svg]:size-4">
                          {item.field.icon}
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isAlreadyAdded && !hasChildren && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Added
                      </span>
                    )}
                    {hasChildren && !query.trim() && (
                      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        {count !== undefined && <span>{count}</span>}
                        <ChevronRightIcon className="size-3.5" />
                      </div>
                    )}
                  </div>
                </ComboboxItem>
              );
            })}
          </ComboboxList>
        )}
      </div>
    </Combobox>
  );
}

function FieldStep<V, O>() {
  const actions = useFilterActions<V, O>();
  const { draft } = useFilterState<V>();

  return (
    <FilterFieldPicker<V, O>
      path={draft?.browsePath ?? draft?.cascaderPath ?? []}
      onPathChange={(next) =>
        actions.dispatchDraft({ type: "setBrowsePath", path: next })
      }
      query={draft?.query ?? ""}
      onQueryChange={(query) =>
        actions.dispatchDraft({ type: "setQuery", query })
      }
      onSelect={(path, defaultOperator) =>
        actions.dispatchDraft({ type: "selectField", path, defaultOperator })
      }
    />
  );
}

export interface FiltersBuilderProps {
  /** Replaces the default Add filter button. */
  trigger?: React.ReactNode;
  className?: string;
}

/**
 * The Add filter popover.
 */
export function FiltersBuilder<V, O>({
  trigger,
  className,
}: FiltersBuilderProps) {
  const actions = useFilterActions<V, O>();
  const focusStore = useFilterFocusStore();
  const sizes = filterControlSizes(actions);
  const { draft, ruleCount } = useFilterState<V>();
  const open = draft !== null && draft.ruleId === null;
  const committing =
    draft !== null && draft.ruleId === null && draft.status === "ready";
  const [instantExit, setInstantExit] = React.useState(false);
  if (committing && !instantExit) setInstantExit(true);
  else if (open && !committing && instantExit) setInstantExit(false);
  const compact = ruleCount > 0;

  React.useEffect(() => {
    if (open) focusStore.closePopup();
  }, [open, focusStore]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) actions.closeDraft();
        else actions.openCreate();
      }}
    >
      <PopoverTrigger
        disabled={actions.disabled}
        {...filterReadOnlyProps(actions)}
        render={
          React.isValidElement(trigger) ? (
            trigger
          ) : (
            <Button
              variant="outline"
              size={compact ? sizes.icon : sizes.button}
              aria-label={compact ? actions.labels.addFilter : undefined}
            >
              <ListFilterPlusIcon />
              {compact ? null : actions.labels.addFilter}
            </Button>
          )
        }
      />
      <PopoverPopup
        align="start"
        className={cn(
          FILTER_FIELD_PICKER_CLASS,
          "max-h-80 w-60 overflow-hidden p-0 **:data-[slot=popover-viewport]:h-auto **:data-[slot=popover-viewport]:max-h-80 **:data-[slot=popover-viewport]:px-0 **:data-[slot=popover-viewport]:py-0 **:data-[slot=popover-viewport]:[--viewport-inline-padding:0px]",
          instantExit &&
            cn(
              "data-ending-style:animate-none data-ending-style:transition-none",
              "data-[state=closed]:animate-none data-[state=closed]:transition-none",
            ),
          actions.fieldPickerClassName,
          className,
        )}
      >
        <FieldStep<V, O> />
      </PopoverPopup>
    </Popover>
  );
}
