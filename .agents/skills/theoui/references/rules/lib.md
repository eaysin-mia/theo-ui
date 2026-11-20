# General Utilities (theoui/lib)

Use this guide when importing and utilizing utilities from `"theoui/lib"`.

## 1. Class Name Merger (`cn`)

`theoui` provides `cn` built on `clsx` and `tailwind-merge` for safe conditional styling and class composition:

```tsx
import { cn } from "theoui/lib";

export function CardWrapper({ className, isFeatured, children }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        isFeatured && "border-primary ring-1 ring-primary/20",
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

## 2. Syntax Highlighter (`theoui/lib/highlighter`)

Requires `shiki` peer dependency:

```tsx
import { loadHighlighter } from "theoui/lib/highlighter";
```

---

## 3. Composer Helpers

Utilities for handling multi-line composer text, clipboard copy/paste, and mention queries:

```tsx
import {
  getComposerText,
  parseComposerClipboard,
  queryComposerMentions,
} from "theoui/lib";
```
