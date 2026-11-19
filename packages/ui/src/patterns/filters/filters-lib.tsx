import type {
  FilterField,
  FilterIndex,
  FilterOperator,
  FilterOption,
} from "theoui/patterns/filters/filters-types";

/* -------------------------------------------------------------------------- */
/*                                    Menus                                   */
/* -------------------------------------------------------------------------- */

/** Menu styling for filter popovers and dropdowns. */
export const FILTER_MENU_CLASS =
  "w-max min-w-32 max-w-[min(24rem,calc(100vw-2rem))] [&_[data-slot=dropdown-menu-item]]:min-w-0";

/** Label styling for menu items with truncation. */
export const FILTER_MENU_LABEL_CLASS = "min-w-0 truncate";

/** Panel styling for the field picker. */
export const FILTER_FIELD_PICKER_CLASS = "w-auto min-w-56 p-0";

/* -------------------------------------------------------------------------- */
/*                                    Paths                                   */
/* -------------------------------------------------------------------------- */

/** Root key for `childrenOf`; a control char cannot collide with a field id. */
export const FILTER_ROOT_KEY = "\u0000root";

/** Separator between path segments in the flat map keys. */
const PATH_SEPARATOR = "\u0000";

export function joinFilterPath(path: readonly string[]): string {
  return path.join(PATH_SEPARATOR);
}

export function splitFilterPath(key: string): string[] {
  return key === "" ? [] : key.split(PATH_SEPARATOR);
}

/** The joined key of a path's parent, or `FILTER_ROOT_KEY` at the top level. */
export function parentFilterKey(path: readonly string[]): string {
  return path.length <= 1 ? FILTER_ROOT_KEY : joinFilterPath(path.slice(0, -1));
}

/* -------------------------------------------------------------------------- */
/*                                  Signature                                 */
/* -------------------------------------------------------------------------- */

/** Computes a content signature of the schema to avoid redundant index rebuilds. */
export function computeFilterSchemaSignature<V, O>(
  fields: readonly FilterField<V, O>[],
): string {
  const parts: string[] = [];

  const walk = (list: readonly FilterField<V, O>[], depth: number) => {
    for (const field of list) {
      parts.push(
        depth +
          ":" +
          field.id +
          "|" +
          (field.label ?? "") +
          "|" +
          (field.type ?? "") +
          "|" +
          (field.defaultOperator ?? "") +
          "|" +
          (field.column ?? "") +
          "|" +
          (field.selectable ? "1" : "0") +
          (field.disabled ? "1" : "0") +
          (field.icon ? "1" : "0") +
          (field.renderValue ? "1" : "0") +
          (field.loadOptions ? "1" : "0") +
          (field.resolveValues ? "1" : "0") +
          "|" +
          (typeof field.editor === "string"
            ? field.editor
            : field.editor
              ? "fn"
              : "") +
          "|" +
          (field.keywords?.join(",") ?? "") +
          "|" +
          (field.count ?? "") +
          "|" +
          // Options are part of the shape, and `exclusive` rides along: it
          // decides what a pick DOES, so turning it on must force a rebuild.
          (field.options
            ? field.options
                .map(
                  (option) =>
                    option.value +
                    "~" +
                    option.label +
                    (option.exclusive ? "~x" : ""),
                )
                .join(",")
            : "") +
          "|" +
          (Array.isArray(field.operators)
            ? field.operators.map((operator) => operator.value).join(",")
            : field.operators
              ? "fn"
              : ""),
      );
      if (field.fields?.length) walk(field.fields, depth + 1);
    }
  };

  walk(fields, 0);
  return parts.join("\n");
}

/* -------------------------------------------------------------------------- */
/*                                    Index                                   */
/* -------------------------------------------------------------------------- */

export function createEmptyFilterIndex<V = unknown, O = unknown>(
  signature = "",
): FilterIndex<V, O> {
  return {
    byPath: new Map(),
    childrenOf: new Map(),
    parentOf: new Map(),
    all: [],
    roots: [],
    signature,
  };
}

/** Normalizes a hierarchical field schema into flat lookups. */
export function buildFilterIndex<V = unknown, O = unknown>(
  fields: readonly FilterField<V, O>[],
  previous?: FilterIndex<V, O> | null,
  /** A signature the caller already computed, to avoid walking twice. */
  precomputedSignature?: string,
): FilterIndex<V, O> {
  const signature =
    precomputedSignature ?? computeFilterSchemaSignature(fields);
  if (previous && previous.signature === signature) return previous;
  if (fields.length === 0) {
    return createEmptyFilterIndex<V, O>(signature);
  }

  const byPath = new Map<string, FilterField<V, O>>();
  const childrenOf = new Map<string, FilterField<V, O>[]>();
  const parentOf = new Map<string, string>();
  const all: { field: FilterField<V, O>; path: string[] }[] = [];
  const roots: FilterField<V, O>[] = [];

  const walk = (
    list: readonly FilterField<V, O>[],
    parentPath: string[],
    parentKey: string,
  ) => {
    const accepted: FilterField<V, O>[] = [];
    const seen = new Set<string>();

    for (const field of list) {
      if (seen.has(field.id)) continue;
      seen.add(field.id);

      const path = [...parentPath, field.id];
      const key = joinFilterPath(path);
      if (byPath.has(key)) continue;

      byPath.set(key, field);
      parentOf.set(key, parentKey === FILTER_ROOT_KEY ? "" : parentKey);
      all.push({ field, path });
      accepted.push(field);

      if (field.fields?.length) walk(field.fields, path, key);
    }

    childrenOf.set(parentKey, accepted);
    if (parentKey === FILTER_ROOT_KEY) roots.push(...accepted);
  };

  walk(fields, [], FILTER_ROOT_KEY);

  return { byPath, childrenOf, parentOf, all, roots, signature };
}

export function getFilterField<V, O>(
  index: FilterIndex<V, O>,
  path: readonly string[],
): FilterField<V, O> | undefined {
  return index.byPath.get(joinFilterPath(path));
}

/** The ancestor chain for a path, root first and the field itself last. */
export function getFilterFieldChain<V, O>(
  index: FilterIndex<V, O>,
  path: readonly string[],
): FilterField<V, O>[] {
  const chain: FilterField<V, O>[] = [];
  for (let i = 1; i <= path.length; i++) {
    const field = index.byPath.get(joinFilterPath(path.slice(0, i)));
    if (!field) break;
    chain.push(field);
  }
  return chain;
}

/** Child fields of a path. Pass an empty path for the root level. */
export function getFilterChildren<V, O>(
  index: FilterIndex<V, O>,
  path: readonly string[],
): FilterField<V, O>[] {
  const key = path.length === 0 ? FILTER_ROOT_KEY : joinFilterPath(path);
  return index.childrenOf.get(key) ?? [];
}

export function isFilterBranch<V, O>(field: FilterField<V, O>): boolean {
  return Boolean(field.fields?.length);
}

/** Whether a field can be filtered on. */
export function isFilterFieldSelectable<V, O>(
  field: FilterField<V, O>,
): boolean {
  if (field.disabled) return false;
  return isFilterBranch(field) ? Boolean(field.selectable) : true;
}

/** Whether a field is selectable as a terminal leaf. */
export function isFilterFieldPickable<V, O>(field: FilterField<V, O>): boolean {
  if (field.disabled) return false;
  return !isFilterBranch(field);
}

/** Trailing count for a branch row. */
export function getFilterFieldCount<V, O>(field: FilterField<V, O>): number {
  return field.count ?? field.fields?.length ?? 0;
}

/** Renders a path as "Name > First" using the caller's separator. */
export function formatFilterPath<V, O>(
  index: FilterIndex<V, O>,
  path: readonly string[],
  separator: string,
): string {
  const chain = getFilterFieldChain(index, path);
  if (chain.length === 0) return path.join(separator);
  return chain.map((field) => field.label).join(separator);
}

/** How a path is shortened. */
export type FilterPathCollapse = "none" | "start" | "middle" | "end";

export type FilterPathSegment<V = unknown, O = unknown> =
  | { type: "field"; field: FilterField<V, O> }
  /** The run that was elided, kept so a host can surface it. */
  | { type: "ellipsis"; hidden: FilterField<V, O>[] };

/**
 * Shortens an ancestor chain to at most `maxSegments` names.
 */
export function collapseFilterPath<V, O>(
  chain: readonly FilterField<V, O>[],
  options: { maxSegments?: number; collapse?: FilterPathCollapse } = {},
): FilterPathSegment<V, O>[] {
  const { maxSegments = 3, collapse = "none" } = options;
  const asFields = (
    fields: readonly FilterField<V, O>[],
  ): FilterPathSegment<V, O>[] =>
    fields.map((field) => ({ type: "field" as const, field }));

  if (collapse === "none" || maxSegments <= 0 || chain.length <= maxSegments) {
    return asFields(chain);
  }

  if (collapse === "start") {
    const tail = chain.slice(chain.length - maxSegments);
    return [
      {
        type: "ellipsis",
        hidden: Array.from(chain.slice(0, chain.length - maxSegments)),
      },
      ...asFields(tail),
    ];
  }

  const head = chain.slice(0, 1);
  const tailCount = maxSegments - 1;
  const tail = chain.slice(chain.length - tailCount);
  const hidden = Array.from(chain.slice(1, chain.length - tailCount));

  if (hidden.length === 0) return asFields(chain);

  return [...asFields(head), { type: "ellipsis", hidden }, ...asFields(tail)];
}

/* -------------------------------------------------------------------------- */
/*                                 Combinator                                 */
/* -------------------------------------------------------------------------- */

export type FilterCombinatorSlot = "where" | "toggle" | "echo";

/**
 * Which of the three forms the combinator slot before rule `index` takes. A
 * group has exactly ONE combinator, so only one slot may be interactive: three
 * editable "and"s down a column would imply three independent choices.
 */
export function filterCombinatorSlot(index: number): FilterCombinatorSlot {
  if (index === 0) return "where";
  return index === 1 ? "toggle" : "echo";
}

/* -------------------------------------------------------------------------- */
/*                                   Matching                                 */
/* -------------------------------------------------------------------------- */

/** `toLocaleLowerCase`, so Turkish dotted and dotless i fold as a reader expects. */
export function foldFilterText(text: string): string {
  return text.toLocaleLowerCase();
}

export function normalizeFilterQuery(query: string): string {
  return foldFilterText(query.trim());
}

/** Whether a field matches a normalized query, by label or keywords. */
export function matchesFilterQuery<V, O>(
  field: FilterField<V, O>,
  normalizedQuery: string,
): boolean {
  if (normalizedQuery === "") return true;
  if (foldFilterText(field.label).includes(normalizedQuery)) return true;
  if (field.keywords) {
    for (const keyword of field.keywords) {
      if (foldFilterText(keyword).includes(normalizedQuery)) return true;
    }
  }
  return false;
}

/** Filters a list of fields matching a normalized search query. */
export function filterFilterLevel<V, O>(
  fields: readonly FilterField<V, O>[],
  normalizedQuery: string,
): FilterField<V, O>[] {
  if (normalizedQuery === "") return [...fields];
  return fields.filter((field) => matchesFilterQuery(field, normalizedQuery));
}

/** Searches all selectable fields in the index matching a normalized search query. */
export function searchFilterDeep<V, O>(
  index: FilterIndex<V, O>,
  normalizedQuery: string,
  limit = 200,
): { field: FilterField<V, O>; path: string[] }[] {
  if (normalizedQuery === "") return [];
  const results: { field: FilterField<V, O>; path: string[] }[] = [];
  for (const entry of index.all) {
    if (results.length >= limit) break;
    if (!isFilterFieldSelectable(entry.field)) continue;
    if (matchesFilterQuery(entry.field, normalizedQuery)) results.push(entry);
  }
  return results;
}

/** Filters an option list by a normalized query, by label or keywords. */
export function filterFilterOptions<O>(
  options: readonly FilterOption<O>[],
  normalizedQuery: string,
): FilterOption<O>[] {
  if (normalizedQuery === "") return [...options];
  return options.filter((option) => {
    if (foldFilterText(option.label).includes(normalizedQuery)) return true;
    if (option.keywords) {
      for (const keyword of option.keywords) {
        if (foldFilterText(keyword).includes(normalizedQuery)) return true;
      }
    }
    return false;
  });
}

/* -------------------------------------------------------------------------- */
/*                              Exclusive options                             */
/* -------------------------------------------------------------------------- */

/** Applies exclusive option logic (e.g. "None" / "Unassigned" clears other options). */
export function applyFilterExclusiveSelection(
  next: readonly string[],
  previous: readonly string[],
  isExclusive: (value: string) => boolean,
): readonly string[] {
  const held = new Set(previous);
  const added = next.filter((value) => !held.has(value));
  if (added.length === 0) return next;

  let arrived: string | null = null;
  for (const value of added) {
    if (isExclusive(value)) arrived = value;
  }
  if (arrived !== null) return [arrived];

  const kept = next.filter((value) => !isExclusive(value));
  return kept.length === next.length ? next : kept;
}

/* -------------------------------------------------------------------------- */
/*                                     Ids                                    */
/* -------------------------------------------------------------------------- */

/** Builds a deterministic ID generator for consistent SSR/CSR hydration. */
export function createFilterIdFactory(seed: string): () => string {
  let counter = 0;
  return () => {
    counter += 1;
    return `${seed}${counter}`;
  };
}

/* -------------------------------------------------------------------------- */
/*                              Development checks                            */
/* -------------------------------------------------------------------------- */

const warned = new Set<string>();

/** Warns once per key. Never throws, and is a no-op in production. */
export function warnFilterOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[filters] ${message}`);
}

/** Clears the warn-once memory. For tests. */
export function resetFilterWarnings(): void {
  warned.clear();
}

export interface FilterSchemaIssues {
  /** Ids that are empty, or that collide with a sibling. */
  duplicatePaths: string[];
  emptyIds: string[];
  /** Branches that declare `selectable` but hold no children. */
  emptyBranches: string[];
  /** Fields whose `defaultOperator` is not in their operator list. */
  unknownDefaultOperators: string[];
}

/** Reported, never thrown: a bad schema must degrade, not blank the page. */
export function findFilterSchemaIssues<V, O>(
  fields: readonly FilterField<V, O>[],
  resolveOperators: (field: FilterField<V, O>) => FilterOperator[],
): FilterSchemaIssues {
  const duplicatePaths: string[] = [];
  const emptyIds: string[] = [];
  const emptyBranches: string[] = [];
  const unknownDefaultOperators: string[] = [];

  const walk = (list: readonly FilterField<V, O>[], parentPath: string[]) => {
    const seen = new Set<string>();
    for (const field of list) {
      const label = [...parentPath, field.id].join(".");
      if (!field.id) emptyIds.push(label);
      else if (seen.has(field.id)) duplicatePaths.push(label);
      seen.add(field.id);

      if (field.selectable && field.fields && field.fields.length === 0) {
        emptyBranches.push(label);
      }

      if (field.defaultOperator) {
        const operators = resolveOperators(field);
        if (!operators.some((op) => op.value === field.defaultOperator)) {
          unknownDefaultOperators.push(`${label} -> ${field.defaultOperator}`);
        }
      }

      if (field.fields?.length) walk(field.fields, [...parentPath, field.id]);
    }
  };

  walk(fields, []);
  return { duplicatePaths, emptyIds, emptyBranches, unknownDefaultOperators };
}
