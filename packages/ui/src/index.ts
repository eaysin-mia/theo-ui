// Root entrypoint for theoui
// Contains core primitives, utilities, providers, and hooks.
// Domain modules, heavy optional peer-dependent widgets, and composite patterns are exported via dedicated subpaths:
// - Patterns: "theoui/patterns" or "theoui/patterns/<pattern>"
// - Auth: "theoui/components/auth" and "theoui/lib/auth"
// - Charts: "theoui/components/chart" (requires recharts)
// - Syntax Highlighting: "theoui/lib/highlighter" & "theoui/hooks/use-highlighted-code" (requires shiki)
// - Motion Animations: "theoui/components/auto-height" (requires motion)

// Lib & Utilities
export * from "./lib/utils";

// Global Providers
export { DirectionProvider } from "@base-ui/react/direction-provider";
export { CSPProvider } from "@base-ui/react/csp-provider";

// Hooks
export * from "./hooks";

// Base UI Primitives & Core Components
export * from "./components/accordion";
export * from "./components/alert";
export * from "./components/alert-dialog";
export * from "./components/animated-gradient-text";
export * from "./components/attachment";
export * from "./components/autocomplete";
export * from "./components/avatar";
export * from "./components/badge";
export * from "./components/breadcrumb";
export * from "./components/bubble";
export * from "./components/button";
export * from "./components/calendar";
export * from "./components/card";
export * from "./components/checkbox";
export * from "./components/checkbox-group";
export * from "./components/collapsible";
export * from "./components/combobox";
export * from "./components/command";
export * from "./components/context-menu";
export * from "./components/dialog";
export * from "./components/drawer";
export * from "./components/empty";
export * from "./components/field";
export * from "./components/fieldset";
export * from "./components/file-type";
export * from "./components/form";
export * from "./components/frame";
export * from "./components/group";
export * from "./components/hover-card";
export * from "./components/icon-stack";
export * from "./components/icon-tile";
export * from "./components/input";
export * from "./components/input-group";
export * from "./components/item";
export * from "./components/kbd";
export * from "./components/label";
export * from "./components/marker";
export * from "./components/menu";
export * from "./components/message";
export * from "./components/message-scroller";
export * from "./components/meter";
export * from "./components/navigation-menu";
export * from "./components/number-field";
export * from "./components/otp-field";
export * from "./components/pagination";
export * from "./components/popover";
export * from "./components/preview-card";
export * from "./components/progress";
export * from "./components/radio-group";
export * from "./components/rating";
export * from "./components/relative-time";
export * from "./components/scroll-area";
export * from "./components/scrollspy";
export * from "./components/segmented-control";
export * from "./components/select";
export * from "./components/separator";
export * from "./components/sheet";
export * from "./components/sidebar";
export * from "./components/skeleton";
export * from "./components/slider";
export * from "./components/sortable";
export * from "./components/spinner";
export * from "./components/switch";
export * from "./components/table";
export * from "./components/tabs";
export * from "./components/textarea";
export * from "./components/ticker";
export * from "./components/toast";
export * from "./components/toggle";
export * from "./components/toggle-group";
export * from "./components/toolbar";
export * from "./components/tooltip";
export * from "./components/trace";
