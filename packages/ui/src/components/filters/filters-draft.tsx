import type {
  FilterDraft,
  FilterDraftStep,
  FilterOperatorArity,
} from "@theo/ui/components/filters/filters-types";

/** Reducer actions for the filter builder draft machine. */
export type FilterDraftAction<V = unknown> =
  | { type: "openCreate"; browsePath?: string[]; cascaderPath?: string[] }
  | {
      type: "openAmend";
      ruleId: string;
      step: FilterDraftStep;
      path: string[];
      operator: string | null;
      value: V | undefined;
      browsePath?: string[];
      cascaderPath?: string[];
    }
  | { type: "close" }
  /** Where the user is BROWSING, not the selected field's path. */
  | { type: "setCascaderPath"; path: string[] }
  | { type: "setBrowsePath"; path: string[] }
  | { type: "setQuery"; query: string }
  | {
      type: "selectField";
      path: string[];
      defaultOperator: string | null;
    }
  | {
      type: "selectOperator";
      operator: string;
      arity: FilterOperatorArity;
      /** Carried across the operator change, already coerced. */
      value: V | undefined;
    }
  | { type: "setValue"; value: V | undefined }
  | { type: "commit"; value?: V }
  | { type: "back" }
  | { type: "goto"; step: FilterDraftStep };

export function createFilterDraft<V = unknown>(
  browsePath: string[] = [],
): FilterDraft<V> {
  return {
    step: "field",
    status: "editing",
    ruleId: null,
    path: [],
    browsePath,
    cascaderPath: browsePath,
    operator: null,
    value: undefined,
    query: "",
  };
}

/** null means Back closes the builder rather than stepping back. */
function previousStep(step: FilterDraftStep): FilterDraftStep | null {
  if (step === "value") return "operator";
  if (step === "operator") return "field";
  return null;
}

/** Reducer managing in-flight filter creation and amendment state. */
export function filterDraftReducer<V = unknown>(
  state: FilterDraft<V> | null,
  action: FilterDraftAction<V>,
): FilterDraft<V> | null {
  switch (action.type) {
    case "openCreate":
      return createFilterDraft<V>(
        action.browsePath ?? action.cascaderPath ?? [],
      );

    case "openAmend": {
      const browsePath =
        action.browsePath ?? action.cascaderPath ?? action.path.slice(0, -1);
      return {
        step: action.step,
        status: "editing",
        ruleId: action.ruleId,
        path: action.path,
        // Defaults the picker to the field's own level, so amend opens beside
        // its siblings, not at the root. Callers may override.
        browsePath,
        cascaderPath: browsePath,
        operator: action.operator,
        value: action.value,
        query: "",
      };
    }

    case "close":
      return null;

    case "setBrowsePath":
    case "setCascaderPath":
      if (!state) return state;
      if (state.browsePath === action.path) return state;
      return { ...state, browsePath: action.path, cascaderPath: action.path };

    case "setQuery":
      if (!state) return state;
      if (state.query === action.query) return state;
      return { ...state, query: action.query };

    case "selectField": {
      if (!state) return state;
      // Choosing a field COMMITS at once; the condition is picked on the chip,
      // so the popover never holds a second and third step to walk.
      return {
        ...state,
        path: action.path,
        operator: action.defaultOperator,
        status: "ready",
        // A field change invalidates the value: "Active" means nothing once
        // the field becomes "Created at".
        value: undefined,
        step: "operator",
        query: "",
      };
    }

    case "selectOperator": {
      if (!state) return state;
      // arity "none" is the whole filter; a value step would be an empty panel.
      if (action.arity === "none") {
        return {
          ...state,
          operator: action.operator,
          value: undefined,
          status: "ready",
          query: "",
        };
      }
      return {
        ...state,
        operator: action.operator,
        value: action.value,
        step: "value",
        status: "editing",
        query: "",
      };
    }

    case "setValue":
      if (!state) return state;
      return { ...state, value: action.value };

    case "commit":
      if (!state) return state;
      return {
        ...state,
        value: action.value === undefined ? state.value : action.value,
        status: "ready",
      };

    case "back": {
      if (!state) return state;
      const step = previousStep(state.step);
      if (!step) return null;
      return { ...state, step, status: "editing", query: "" };
    }

    case "goto":
      if (!state) return state;
      if (state.step === action.step) return state;
      return { ...state, step: action.step, status: "editing", query: "" };

    default:
      return state;
  }
}

/**
 * A path is enough. Not an operator: the flow commits when the field is picked,
 * so `operator: ""` is a legitimate committed state. Not a value either, since
 * `arity: "none"` has none and an editor may commit `undefined` to clear.
 */
export function isFilterDraftCommittable<V>(
  draft: FilterDraft<V> | null,
): draft is FilterDraft<V> {
  return Boolean(draft && draft.path.length > 0);
}
