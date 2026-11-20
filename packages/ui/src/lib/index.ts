// General utilities and helpers
export * from "./utils";
export * from "./composer-clipboard";
export * from "./composer-document";
export * from "./composer-editor";
export * from "./composer-query";

// Note: Domain-specific modules with optional peer dependencies are exported via dedicated subpaths:
// - Syntax Highlighter: "#lib/highlighter" (requires shiki)
// - Authentication Plugins: "#lib/auth" (requires better-auth)
