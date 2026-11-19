"use client";

import * as React from "react";
import {
  filterControlSizes,
  filterReadOnlyProps,
  isFilterLocked,
  useFilterActions,
  useFilterChipAutoOpen,
  useFilterChipFocused,
  useFilterFocusEmpty,
  useFilterFocusStore,
  useFilterPopupOpen,
  useFilterRender,
  useFilterReorderable,
} from "@theo/ui/components/filters/filters-context";
import {
  FilterMenu,
  useFilterOptions,
  useFilterValueResolution,
} from "@theo/ui/components/filters/filters-editors";
import {
  collapseFilterPath,
  FILTER_MENU_CLASS,
  FILTER_MENU_LABEL_CLASS,
  formatFilterPath,
  getFilterField,
  getFilterFieldChain,
} from "@theo/ui/components/filters/filters-lib";
import {
  coerceFilterValue,
  getFilterArity,
  getFilterOperator,
  operatorTakesValue,
  visibleFilterOperators,
} from "@theo/ui/components/filters/filters-operators";
import {
  findFilterNode,
  isFilterGroup,
} from "@theo/ui/components/filters/filters-query";
import {
  isFilterDateValue,
  formatFilterDate,
  type FilterDateValue,
} from "@theo/ui/components/filters/filters-date";
import type {
  FilterEditorProps,
  FilterField,
  FilterGroupNode,
  FilterOperator,
  FilterRule,
} from "@theo/ui/components/filters/filters-types";

import { cn } from "@theo/ui/lib/utils";
import { Button, buttonVariants } from "@theo/ui/components/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@theo/ui/components/breadcrumb";
import { Group, GroupSeparator, GroupText } from "@theo/ui/components/group";
import {
  Menu,
  MenuPopup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@theo/ui/components/menu";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@theo/ui/components/popover";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@theo/ui/components/tooltip";
import {
  ChevronRightIcon,
  CornerDownRightIcon,
  CopyIcon,
  ArrowLeftRightIcon,
  LayersIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
  EllipsisVerticalIcon,
} from "lucide-react";

/** Which part of the chip a pointer or key is aimed at. No `field`: the chip's
 *  attribute segment is display only, and only the builder re-picks one. */
type ChipSegment = "operator" | "value" | "menu";

/** The ref half of `autoFocusProps`: a CALLBACK ref, the one shape an editor
 *  can spread onto any element without a cast, and a no-op here. */
const noopAutoFocusRef: React.RefCallback<HTMLElement> = () => {};

function formatSingleValue(
  val: unknown,
  resolveOption: (val: string) => { label: string } | undefined,
): string {
  if (isFilterDateValue(val)) {
    return formatFilterDate(val);
  }
  if (val === undefined || val === null) {
    return "";
  }
  return resolveOption(String(val))?.label ?? String(val);
}

function defaultValueDisplay<V>(
  value: V | undefined,
  operator: FilterOperator | undefined,
  resolveOption: (value: string) => { label: string } | undefined,
  labels: ReturnType<typeof useFilterActions>["labels"],
  fieldPlaceholder?: string,
  optionBacked?: boolean,
): string {
  const emptyLabel = optionBacked
    ? labels.selectPlaceholder
    : (fieldPlaceholder ?? labels.valuePlaceholder);
  if (value === undefined || value === null || value === "") {
    return emptyLabel;
  }

  if (getFilterArity(operator) === "range" && Array.isArray(value)) {
    const fromStr = formatSingleValue(value[0], resolveOption);
    const toStr = formatSingleValue(value[1], resolveOption);
    return labels.valueRange(fromStr, toStr);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return emptyLabel;
    if (value.length === 1) {
      return formatSingleValue(value[0], resolveOption) || emptyLabel;
    }
    return labels.valueCount(value.length);
  }

  if (typeof value === "boolean") return value ? "True" : "False";

  if (isFilterDateValue(value)) {
    return formatFilterDate(value);
  }

  return formatSingleValue(value, resolveOption);
}

/** Renders value text with an optional leading icon. */
function valueWithIcon<V>(
  value: V | undefined,
  text: string,
  resolveOption: (value: string) => { icon?: React.ReactNode } | undefined,
): React.ReactNode {
  const single =
    value === undefined || value === null || Array.isArray(value)
      ? Array.isArray(value) && value.length === 1
        ? String(value[0])
        : null
      : String(value);
  const icon = single ? resolveOption(single)?.icon : null;
  if (!icon) return text;
  return (
    <span className="flex items-center gap-1.5">
      {icon}
      {text}
    </span>
  );
}

/** Separator icon between path segments. */
function FilterPathSeparator() {
  return (
    <ChevronRightIcon
      aria-hidden="true"
      data-slot="filter-path-separator"
      className="mx-0.75 inline-block size-3 shrink-0 self-center align-[calc(0.3635em-0.375rem)] text-muted-foreground"
    />
  );
}

/** Renders an ellipsis with a tooltip showing the full path. */
function FilterPathEllipsis({ full }: { full: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              aria-hidden="true"
              data-slot="filter-path-ellipsis"
              className="shrink-0 self-center text-muted-foreground"
            >
              ...
            </span>
          }
        />
        <TooltipPopup>{full}</TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Everything a rule needs in order to be READ, in either chrome. */
export interface FilterRuleDisplay {
  pathText: string;
  pathLabel: React.ReactNode;
  /** Whether `pathLabel` shows fewer names than the path has, so the cell's
   *  own `title` can step aside for the ellipsis segment's tooltip. */
  pathCollapsed: boolean;
  operatorLabel: string;
  valueLabel: React.ReactNode;
  /** The same value as PLAIN TEXT, for an accessible name. Never scraped from
   *  the `renderValue` node: whatever text survives inside avatars and a count
   *  badge announces "plus one" for two people. Kept separate from
   *  `valueLabel`, not derived from it: a React node has no honest text to
   *  read back. A field whose values do not stringify supplies `valueText`
   *  itself, or the built-in fallback says "[object Object]" to exactly the
   *  audience the visible display is hiding it from. */
  valueText: string;
  /** The same value with any collapsed COUNT spelled out. "3 selected" cannot
   *  be recovered from, which is fine while the editor opens and not once
   *  locked, so the control carries this as `title` and, locked, as its name. */
  valueFullText: string;
  valueEmpty: boolean;
}

/** How one rule reads, resolved once and shared by both chromes, so a consumer
 *  `renderValue`, the field's own and the built-in cannot disagree. */
export function useFilterRuleDisplay<V, O>(
  rule: FilterRule<V>,
  field: FilterField<V, O> | undefined,
  operator: FilterOperator | undefined,
): FilterRuleDisplay {
  const actions = useFilterActions<V, O>();
  const render = useFilterRender<V, O>();
  // Lazily: a label needs no options until an editor actually opens.
  const optionsState = useFilterOptions<V, O>(field, false);

  const values =
    rule.value === undefined || rule.value === null
      ? []
      : Array.isArray(rule.value)
        ? rule.value
        : [rule.value];

  // Saved views: values the loader has never returned are resolved through the
  // field's own `resolveValues`, so a restored chip reads "John Doe", not an id.
  useFilterValueResolution(field, values);

  const pathText = formatFilterPath(
    actions.index,
    rule.path,
    actions.labels.pathSeparator,
  );

  const chain = getFilterFieldChain(actions.index, rule.path);
  // Path segments collapsed according to maxPathSegments configuration.
  const segments = collapseFilterPath(chain, {
    maxSegments: actions.maxPathSegments,
    collapse: actions.pathCollapse,
  });
  const pathCollapsed = segments.some((segment) => segment.type === "ellipsis");
  const pathLabel = chain.length ? (
    <Breadcrumb className="inline-flex">
      <BreadcrumbList className="flex-nowrap gap-1 text-inherit sm:gap-1">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <React.Fragment
              key={
                segment.type === "field"
                  ? `${index}:${segment.field.id}`
                  : `${index}:ellipsis`
              }
            >
              {index > 0 && (
                <BreadcrumbSeparator className="opacity-60 [&>svg]:size-3" />
              )}
              <BreadcrumbItem className="gap-1">
                {segment.type === "field" ? (
                  isLast ? (
                    <BreadcrumbPage className="font-normal text-inherit">
                      {segment.field.label}
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-muted-foreground">
                      {segment.field.label}
                    </span>
                  )
                ) : (
                  <FilterPathEllipsis full={pathText} />
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  ) : (
    pathText
  );

  const operatorLabel = operator
    ? rule.negated
      ? actions.labels.negated(operator.label)
      : operator.label
    : rule.operator || actions.labels.selectCondition;

  const valueEmpty =
    rule.value === undefined ||
    rule.value === null ||
    (typeof rule.value === "string" && rule.value === "") ||
    values.length === 0;

  if (!field) {
    return {
      pathText,
      pathLabel,
      pathCollapsed,
      operatorLabel,
      valueLabel: "",
      valueText: "",
      valueFullText: "",
      valueEmpty,
    };
  }

  const valueContext = {
    value: rule.value,
    values,
    field,
    operator: operator ?? { value: rule.operator, label: rule.operator },
    // Resolved, not empty: a custom display needs the option behind each value.
    options: values
      .map((entry) => optionsState.resolve(String(entry)))
      .filter((opt): opt is NonNullable<typeof opt> => Boolean(opt)),
    labels: actions.labels,
  };

  // Computed even when a custom display replaces it: this is the string the
  // accessible name is built from. `field.valueText` overrides it.
  const valueText = field.valueText
    ? field.valueText(valueContext)
    : defaultValueDisplay(
        rule.value,
        operator,
        optionsState.resolve,
        actions.labels,
        field.placeholder,
        // Option-backed by the FIELD, not the operator: `is any of` is
        // multi-value on a plain text field too, and that one is typed into.
        field.type === "select" ||
          field.type === "multiselect" ||
          Boolean(field.options?.length) ||
          Boolean(field.loadOptions),
      );

  const valueLabel = render.renderValue
    ? render.renderValue(valueContext)
    : field.renderValue
      ? field.renderValue(valueContext)
      : valueWithIcon(rule.value, valueText, optionsState.resolve);

  // The list behind the count, or the same text again. Multi-value only: a
  // RANGE also stores an array but already spells both ends out ("10 to 99").
  const valueFullText =
    field.valueText ||
    !Array.isArray(rule.value) ||
    getFilterArity(operator) === "range" ||
    values.length < 2
      ? valueText
      : actions.labels.valueDetail(
          valueText,
          values.map(
            (entry) =>
              optionsState.resolve(String(entry))?.label ?? String(entry),
          ),
        );

  return {
    pathText,
    pathLabel,
    pathCollapsed,
    operatorLabel,
    valueLabel,
    valueText,
    valueFullText,
    valueEmpty,
  };
}

interface FilterValueEditorProps<V = unknown, O = unknown> {
  rule: FilterRule<V>;
  field: FilterField<V, O>;
  operator: FilterOperator;
  /** Whether the surface holding it is showing. Gates the option service. */
  open: boolean;
  onClose: () => void;
}

/** The value editor - draft, option service, commit - with NO surface of its
 *  own, so surface and wiring can be replaced independently. The draft lives
 *  here, so a text filter dispatches once on commit, not once per keystroke. */
function FilterValueEditor<V, O>({
  rule,
  field,
  operator,
  open,
  onClose,
}: FilterValueEditorProps<V, O>) {
  const actions = useFilterActions<V, O>();
  const [draft, setDraft] = React.useState<V | undefined>(rule.value);

  React.useEffect(() => {
    if (open) setDraft(rule.value);
  }, [open, rule.value]);

  const options = useFilterOptions<V, O>(field, open);
  // A LOOKUP, not a definition: every result is a module-level built-in or the
  // consumer's own component, so the editor is never remounted mid-edit.
  const editor = React.useMemo(
    () => actions.resolveEditor(field, operator),
    [actions, field, operator],
  );

  if (!editor) return null;

  const editorProps: FilterEditorProps<V, O> = {
    field,
    operator,
    value: draft,
    onValueChange: (next) => setDraft(next as V),
    host: "amend",
    autoFocusProps: {
      ref: noopAutoFocusRef,
      autoFocus: true,
    },
    commit: (next, commitOptions) => {
      actions.updateRule(rule.id, {
        value: (next === undefined ? draft : next) as V,
      });
      // A multi-select commits per toggle and asks to stay put; others dismiss.
      if (commitOptions?.close === false) return;
      onClose();
    },
    cancel: onClose,
    // The same as cancel, honestly: `back` means something only to a `create`
    // host.
    back: onClose,
    options,
    labels: actions.labels,
  };

  // `createElement` rather than JSX: the component comes out of a lookup, so
  // `<Editor />` trips `react-hooks/static-components`. The fragment keeps the
  // props object, which carries a ref, from looking like a ref read in render.
  return <>{React.createElement(editor, editorProps)}</>;
}

/** One step of the flow, released when the panel that owes it has LEFT THE
 *  DOM: both popovers keep portal content mounted through the exit transition,
 *  so this unmount IS that moment and nothing is timed. `onRelease` is used AS
 *  the cleanup, so an unmemoized callback fires its step early. */
function FilterStepHandoff({ onRelease }: { onRelease: () => void }) {
  React.useEffect(() => onRelease, [onRelease]);
  return null;
}

/** The value host: the editor in a popover anchored to the value segment, and
 *  BOTH routes end here. The operator popover used to draw the editor itself,
 *  so a handed-off panel sat a segment's width left of a second press. */
export interface FilterValuePopoverProps<V = unknown, O = unknown> {
  rule: FilterRule<V>;
  field: FilterField<V, O>;
  operator: FilterOperator | undefined;
  /** The element that opens it, WITH its own children: a chip segment must be
   *  a direct child of its `Group` for the pill to fuse. */
  trigger: React.ReactElement<{
    disabled?: boolean;
    "aria-disabled"?: boolean | "true" | "false";
  }>;
  /** Content rendered inside the trigger button. */
  triggerContent?: React.ReactNode;
  className?: string;
}

export function FilterValuePopover<V, O>({
  rule,
  field,
  operator,
  trigger,
  triggerContent,
  className,
}: FilterValuePopoverProps<V, O>) {
  const actions = useFilterActions<V, O>();
  const focusStore = useFilterFocusStore();
  const autoOpen = useFilterChipAutoOpen(rule.id) === "value";
  const [open, setOpen] = useFilterPopupOpen(rule.id, "value");
  const locked = isFilterLocked(actions);

  React.useEffect(() => {
    if (!autoOpen || open) return;
    if (locked) {
      focusStore.set({ id: rule.id, segment: "value", autoOpen: false });
      return;
    }
    const rafId = requestAnimationFrame(() => {
      setOpen(true);
      focusStore.set({ id: rule.id, segment: "value", autoOpen: false });
    });
    return () => cancelAnimationFrame(rafId);
  }, [autoOpen, open, focusStore, rule.id, locked, setOpen]);

  // Nothing to open, but the trigger still renders so the value keeps its
  // place, and it wears the bar's state: that hangs on the TRIGGER below,
  // which this path never reaches, so the segment used to look live.
  if (!operator || !actions.resolveEditor(field, operator)) {
    return React.cloneElement(
      trigger,
      { disabled: actions.disabled, ...filterReadOnlyProps(actions) },
      triggerContent,
    );
  }

  return (
    // REFUSES to open while locked rather than leaving it to the trigger: an
    // `aria-disabled` control that still opens an editor is one that lied.
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next && locked) return;
        setOpen(next);
      }}
    >
      {/* The trigger IS the segment, never a wrapper. `Group` fuses
          DIRECT children only (`*:data-slot:rounded-r-none`,
          `[&>[data-slot]~[data-slot]]:border-l-0`), so a nested one keeps its
          own border and the chip reads as separate badges. */}
      <PopoverTrigger
        render={trigger}
        disabled={actions.disabled}
        {...filterReadOnlyProps(actions)}
      >
        {triggerContent}
      </PopoverTrigger>
      <PopoverPopup
        align="start"
        className={cn(
          "max-h-80 w-auto p-0 has-data-[slot=calendar]:max-h-none **:data-[slot=popover-viewport]:h-auto **:data-[slot=popover-viewport]:max-h-80 **:data-[slot=popover-viewport]:px-0 **:data-[slot=popover-viewport]:py-0 **:data-[slot=popover-viewport]:[--viewport-inline-padding:0px] **:data-[slot=popover-viewport]:has-data-[slot=calendar]:max-h-none **:data-[slot=popover-viewport]:has-data-[slot=calendar]:p-2",
          className,
        )}
      >
        <FilterValueEditor<V, O>
          rule={rule}
          field={field}
          operator={operator}
          open={open}
          onClose={() => {
            setOpen(false);
            focusStore.set({ id: rule.id, segment: "value", autoOpen: false });
          }}
        />
      </PopoverPopup>
    </Popover>
  );
}

/* A chip's ATTRIBUTE is fixed once the chip exists: no field popover here. A
   new field invalidates the operator and the value, so "amending" threw both
   away. The builder keeps its picker, where a row reads as a form. */

/** The condition menu, and the step after it. The list is the cascader run
 *  flat: the old hand-rolled one marked the keyboard HIGHLIGHT with
 *  `aria-selected` and had no Home, End or typeahead. It HANDS OFF to the
 *  value popover once its own panel has left the DOM; advancing in place
 *  anchored the editor to the CONDITION segment and doubled up in the row. */
export interface FilterOperatorPopoverProps<V = unknown, O = unknown> {
  rule: FilterRule<V>;
  field: FilterField<V, O>;
  trigger: React.ReactElement<{
    disabled?: boolean;
    "aria-disabled"?: boolean | "true" | "false";
  }>;
  /** Content rendered inside the trigger button. */
  triggerContent?: React.ReactNode;
  className?: string;
}

export function FilterOperatorPopover<V, O>({
  rule,
  field,
  trigger,
  triggerContent,
  className,
}: FilterOperatorPopoverProps<V, O>) {
  const actions = useFilterActions<V, O>();
  const focusStore = useFilterFocusStore();
  const autoOpen = useFilterChipAutoOpen(rule.id) === "operator";
  const [open, setOpen] = useFilterPopupOpen(rule.id, "operator");
  const locked = isFilterLocked(actions);
  const handoff = React.useRef(false);
  const operators = actions.resolveOperators(field);
  const operator = getFilterOperator(operators, rule.operator);

  const items = React.useMemo(
    () =>
      visibleFilterOperators(operators).map((entry) => ({
        value: entry.value,
        label: entry.label,
      })),
    [operators],
  );

  React.useEffect(() => {
    if (!autoOpen || open) return;
    handoff.current = false;
    if (locked) {
      focusStore.set({ id: rule.id, segment: "operator", autoOpen: false });
      return;
    }
    const rafId = requestAnimationFrame(() => {
      setOpen(true);
      focusStore.set({ id: rule.id, segment: "operator", autoOpen: false });
    });
    return () => cancelAnimationFrame(rafId);
  }, [autoOpen, open, focusStore, rule.id, locked, setOpen]);

  const close = () => {
    handoff.current = false;
    setOpen(false);
    focusStore.set({ id: rule.id, segment: "operator", autoOpen: false });
    if (!rule.operator) {
      actions.removeNode(rule.id);
    }
  };

  const release = React.useCallback(() => {
    if (!handoff.current) return;
    focusStore.set({ id: rule.id, segment: "value", autoOpen: true });
  }, [focusStore, rule.id]);

  React.useEffect(
    () => () => {
      handoff.current = false;
    },
    [],
  );

  return (
    <Menu
      open={open}
      onOpenChange={(next) => {
        if (next && locked) return;
        if (next) {
          handoff.current = false;
          setOpen(true);
        } else {
          setOpen(false);
          if (!rule.operator && !handoff.current) {
            actions.removeNode(rule.id);
          }
        }
      }}
    >
      <MenuTrigger
        render={trigger}
        disabled={actions.disabled}
        {...filterReadOnlyProps(actions)}
      >
        {triggerContent}
      </MenuTrigger>
      <MenuPopup align="start" className={cn("w-auto min-w-36", className)}>
        <FilterStepHandoff onRelease={release} />
        <MenuRadioGroup
          value={rule.operator ?? ""}
          onValueChange={(val) => {
            if (!val) {
              close();
              return;
            }
            const chosen = getFilterOperator(operators, val);
            const building = !rule.operator;
            actions.updateRule(rule.id, {
              operator: val,
              value: coerceFilterValue(
                rule.value,
                getFilterOperator(operators, rule.operator),
                chosen,
              ) as V,
            });
            if (building && operatorTakesValue(chosen)) {
              handoff.current = true;
              setOpen(false);
              return;
            }
            close();
          }}
        >
          {items.map((item) => (
            <MenuRadioItem key={item.value} value={item.value}>
              {item.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}

/** The keyboard path to a CROSS-GROUP move: Alt+Arrow reorders within the
 *  owning group only and Wrap creates a NEW group, so the drag layer's
 *  cross-group move had no keyboard parity. Numbered in document order. */
export function FilterMoveToMenuItems({ nodeId }: { nodeId: string }) {
  const actions = useFilterActions();
  // A menu ITEM takes the native word: both twins already make `disabled`
  // roving-focusable and `aria-disabled`.
  const reorderable = useFilterReorderable();
  const locked = isFilterLocked(actions);
  // Read at render time: the menu's content mounts when the menu opens, so
  // this is the tree the user is looking at.
  const query = actions.getQuery();
  const found = findFilterNode(query, nodeId);
  if (!found || !found.parent) return null;

  const destinations: { id: string; label: string; size: number }[] = [];
  if (found.parent.id !== query.id) {
    destinations.push({
      id: query.id,
      label: actions.labels.moveToTopLevel,
      size: query.rules.length,
    });
  }

  let position = 0;
  // `inside` suppresses the PUSH and not the walk, so the numbering stays
  // document order rather than renumbering every group after this one. Counted
  // before the exclusions for the same reason: the current parent is not
  // offered but still holds its number, so the numbering is stable whichever
  // row's menu is open.
  const visit = (group: FilterGroupNode<unknown>, inside: boolean) => {
    for (const child of group.rules) {
      if (!isFilterGroup(child)) continue;
      position += 1;
      // Itself and everything under it: `moveFilterNodeTo` already refuses that
      // move - it would detach the subtree and leave a cycle - so offering it
      // would be a menu row that quietly does nothing.
      const within = inside || child.id === nodeId;
      if (!within && child.id !== found.parent!.id) {
        destinations.push({
          id: child.id,
          label: actions.labels.moveToGroup(position),
          size: child.rules.length,
        });
      }
      visit(child, within);
    }
  };
  visit(query, false);

  if (destinations.length === 0) return null;

  // The THIRD route into a move, gated on the same switch as the grip and
  // Alt+Arrow: ungated, a builder that draws no handle still reordered here.
  if (!reorderable) return null;

  return (
    <>
      {destinations.map((destination) => (
        <MenuItem
          key={destination.id}
          disabled={locked}
          onClick={() =>
            actions.moveNodeTo(nodeId, destination.id, destination.size)
          }
        >
          {/* A bend into the destination: movement, not duplication or nesting. */}
          <CornerDownRightIcon aria-hidden="true" />
          <span className={FILTER_MENU_LABEL_CLASS}>{destination.label}</span>
        </MenuItem>
      ))}
    </>
  );
}

/** The per-rule actions, without the trigger: the chip's kebab and a builder
 *  row's kebab act on the same rule. `allowGrouping` is the CHROME's answer;
 *  "Convert to advanced filter" is the CONSUMER's, and hides itself there. */
export function FilterRuleMenuItems({
  ruleId,
  /** Offer "Wrap in condition group". Off for the chip row, which cannot draw
   *  a group; on in the builder, the only way to nest without dragging. */
  allowGrouping = false,
}: {
  ruleId: string;
  allowGrouping?: boolean;
}) {
  const actions = useFilterActions();
  // Gated here as well as at the trigger, because this is EXPORTED: a consumer
  // composing their own menu gets rows that say they are unavailable.
  const locked = isFilterLocked(actions);
  return (
    /* Every row leads with an icon. `IconPlaceholder` because the source ships
       under five icon sets; no size class, because each style already sizes an
       unsized svg in a menu row; `aria-hidden`, the label IS the name. */
    <>
      <MenuItem disabled={locked} onClick={() => actions.duplicateNode(ruleId)}>
        <CopyIcon aria-hidden="true" />
        <span className={FILTER_MENU_LABEL_CLASS}>
          {actions.labels.duplicate}
        </span>
      </MenuItem>
      <MenuItem disabled={locked} onClick={() => actions.negateRule(ruleId)}>
        {/* Two arrows swapping: negation flips to the declared inverse. */}
        <ArrowLeftRightIcon aria-hidden="true" />
        <span className={FILTER_MENU_LABEL_CLASS}>{actions.labels.negate}</span>
      </MenuItem>
      {allowGrouping ? (
        <MenuItem
          disabled={locked}
          onClick={() => actions.wrapNodeInGroup(ruleId)}
        >
          {/* Layers: braces read as grouping in only three of the five sets. */}
          <LayersIcon aria-hidden="true" />
          <span className={FILTER_MENU_LABEL_CLASS}>
            {actions.labels.wrapInGroup}
          </span>
        </MenuItem>
      ) : null}
      {allowGrouping ? <FilterMoveToMenuItems nodeId={ruleId} /> : null}
      {/* OPTIONAL, and gated on both halves of "would this do anything": the
          handler is the consumer's opt-in, and an already-advanced bar has
          nothing to convert. NOT gated on `locked`: it changes no query, is
          handed no mutator, and the shipped kebab will not open while locked. */}
      {actions.convertToAdvanced && actions.variant !== "advanced" ? (
        <MenuItem onClick={() => actions.convertToAdvanced?.()}>
          {/* Sliders: the one "advanced settings" glyph in all five sets. */}
          <SlidersHorizontalIcon aria-hidden="true" />
          <span className={FILTER_MENU_LABEL_CLASS}>
            {actions.labels.convertToAdvanced}
          </span>
        </MenuItem>
      ) : null}
      <MenuItem
        variant="destructive"
        disabled={locked}
        onClick={() => actions.removeNode(ruleId)}
      >
        {/* No colour: the destructive variant already paints the row's svgs. */}
        <Trash2Icon aria-hidden="true" />
        <span className={FILTER_MENU_LABEL_CLASS}>{actions.labels.remove}</span>
      </MenuItem>
    </>
  );
}

export interface FilterChipProps<V = unknown> {
  rule: FilterRule<V>;
  index: number;
}

/** One filter, as a chip. Memoization means something here: the actions
 *  context is stable, the focus store is subscribed to a boolean and the query
 *  shares structure, so editing one filter of forty re-renders one chip. */
function FilterChipImpl<V, O>({ rule, index }: FilterChipProps<V>) {
  const actions = useFilterActions<V, O>();
  const render = useFilterRender<V, O>();
  const focusStore = useFilterFocusStore();
  const focused = useFilterChipFocused(rule.id);
  const noFocus = useFilterFocusEmpty();
  const locked = isFilterLocked(actions);
  // THE CHIP'S HEIGHT, by way of the one button in it that has one:
  // `Group` is `items-stretch` and no style gives a text segment a
  // height, so the kebab's rung is the pill's. The RADIUS survives because
  // every style whose `icon-sm` rounds differently re-pins it in a group.
  const sizes = filterControlSizes(actions);
  // The kebab is CONTROLLED so it can refuse to open: every mutating row
  // behind it is gated. That puts "Convert to advanced filter" out of reach
  // while locked; a consumer-composed menu still draws it.
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Exactly one chip is in the tab order at a time. Before anything has been
  // focused that is the first chip, so Tab reaches the row in one press.
  const isTabStop = focused || (noFocus && index === 0);

  const field = getFilterField(actions.index, rule.path);
  const operators = field ? actions.resolveOperators(field) : [];
  const operator = getFilterOperator(operators, rule.operator);

  const {
    pathText,
    pathLabel,
    pathCollapsed,
    operatorLabel,
    valueLabel,
    valueText,
    valueFullText,
    valueEmpty,
  } = useFilterRuleDisplay<V, O>(rule, field, operator);

  if (!field) {
    // A rule pointing at a field the schema no longer has. Dropping it loses a
    // saved view's data; rendering nothing leaves an invisible condition still
    // filtering. It carries the SAME roving wiring as a real chip: `data-slot`
    // alone joined the arrow-key query with no `tabIndex` to land on.
    return (
      <Group
        data-slot="filter-chip"
        data-unknown=""
        role="group"
        aria-label={actions.labels.filterLabel(
          rule.path.join(actions.labels.pathSeparator),
        )}
        data-focused={focused || undefined}
        data-rule-id={rule.id}
        data-index={index}
        tabIndex={isTabStop ? 0 : -1}
        onFocusCapture={() => {
          if (!focused)
            focusStore.set({ id: rule.id, segment: null, autoOpen: false });
        }}
      >
        <GroupText
          className={cn(
            buttonVariants({ size: sizes.button, variant: "outline" }),
            "pointer-events-none",
          )}
        >
          {rule.path.join(actions.labels.pathSeparator)}
        </GroupText>
        <GroupSeparator />
        <Button
          variant="outline"
          size={sizes.icon}
          aria-label={actions.labels.remove}
          /* It had no gate at all, so the one chip whose whole purpose is to be
             removed could be removed from a bar that refuses every other edit. */
          disabled={actions.disabled}
          {...filterReadOnlyProps(actions)}
          onClick={() => actions.removeNode(rule.id)}
        >
          <XIcon />
        </Button>
      </Group>
    );
  }

  if (render.renderChip) return <>{render.renderChip(rule)}</>;

  const focusSegment = (segment: ChipSegment) =>
    focusStore.set({ id: rule.id, segment, autoOpen: false });

  // A rule with no condition yet, KEPT rather than removed (see
  // `isFilterRuleComplete`), so it has to read as unfinished. Through WORDS:
  // the dashed outline it replaces degraded to an underline under sera.
  const incomplete = !rule.operator;

  // The same test the value segment renders under, so the name matches the
  // chip: `valueText` alone appended a placeholder to valueless conditions.
  const hasValue = Boolean(rule.operator) && operatorTakesValue(operator);

  // The value's spoken form in the chip's NAME: a name is not a prompt, so
  // "Description contains enter text..." becomes "no value".
  const valueName =
    valueEmpty && !field.valueText ? actions.labels.noValue : valueText;

  return (
    <Group
      data-slot="filter-chip"
      role="group"
      aria-label={actions.labels.filterLabel(
        `${pathText} ${operatorLabel}${hasValue ? ` ${valueName}` : ""}`.trim() +
          (incomplete ? `, ${actions.labels.incomplete}` : ""),
      )}
      data-focused={focused || undefined}
      data-incomplete={incomplete || undefined}
      data-rule-id={rule.id}
      tabIndex={isTabStop ? 0 : -1}
      onFocusCapture={() => {
        if (!focused)
          focusStore.set({ id: rule.id, segment: null, autoOpen: false });
      }}
      data-index={index}
    >
      {/* DISPLAY ONLY: a div, not a button, not a tab stop, no popover. The
          attribute is fixed for the life of the chip. */}
      <GroupText
        /* Dropped while the path is collapsed: the ellipsis inside carries the
           same sentence as a tooltip, and the two would stack. */
        title={pathCollapsed ? undefined : pathText}
        className={cn(
          buttonVariants({ size: sizes.button, variant: "outline" }),
          "pointer-events-none gap-1.5",
        )}
      >
        {field.icon}
        <span className="flex items-center">{pathLabel}</span>
      </GroupText>

      <GroupSeparator />
      <FilterOperatorPopover
        rule={rule}
        field={field}
        triggerContent={operatorLabel}
        trigger={
          <Button
            variant="outline"
            size={sizes.button}
            className={cn(
              "font-normal",
              incomplete ? "text-foreground" : "text-muted-foreground",
            )}
            onPointerDown={() => focusSegment("operator")}
          />
        }
      />

      {/* No condition, no value: `getFilterArity(undefined)` defaults to "one",
          so testing the operator alone renders a stray value segment. */}
      {hasValue ? (
        <>
          <GroupSeparator />
          <FilterValuePopover
            rule={rule}
            field={field}
            operator={operator}
            triggerContent={valueLabel}
            trigger={
              <Button
                variant="outline"
                size={sizes.button}
                aria-label={locked ? valueFullText : valueText}
                title={valueFullText === valueText ? undefined : valueFullText}
                className={cn(
                  "font-normal",
                  valueEmpty && "text-muted-foreground",
                )}
                onPointerDown={() => focusSegment("value")}
              />
            }
          />
        </>
      ) : null}

      <GroupSeparator />
      <Menu
        open={menuOpen}
        onOpenChange={(next) => {
          if (next && locked) return;
          setMenuOpen(next);
        }}
      >
        <MenuTrigger
          disabled={actions.disabled}
          {...filterReadOnlyProps(actions)}
          render={
            <Button
              variant="outline"
              size={sizes.icon}
              aria-label={actions.labels.chipMenu(field.label)}
              onPointerDown={() => focusSegment("menu")}
            />
          }
        >
          <EllipsisVerticalIcon />
        </MenuTrigger>
        {/* The SAME sizing the builder's menus use, from one constant: a menu
            that cuts "Convert to group" in one chrome is one defect twice. */}
        <MenuPopup
          align="end"
          className={cn(FILTER_MENU_CLASS, actions.menuClassName)}
        >
          <FilterRuleMenuItems ruleId={rule.id} />
        </MenuPopup>
      </Menu>
    </Group>
  );
}

export const FilterChip = React.memo(FilterChipImpl) as typeof FilterChipImpl;
