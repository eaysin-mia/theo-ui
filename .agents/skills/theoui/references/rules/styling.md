# Styling Rules (theoui)

Use this guide when styling `theoui` components and application layouts.

## Core Rules

1. **Semantic Color Tokens:**
   Always use semantic theme tokens rather than raw palette colors:
   - Surface backgrounds: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`
   - Foreground text: `text-foreground`, `text-muted-foreground`, `text-card-foreground`
   - Borders: `border-border`, `border-input`
   - Primary & Accent actions: `bg-primary text-primary-foreground`, `bg-accent text-accent-foreground`
   - Destructive: `bg-destructive text-destructive-foreground`

2. **Tailwind CSS v4 Compatibility:**
   - `theoui` is built on Tailwind CSS v4 using CSS variable theme mappings and OKLCH color spaces.
   - Do **NOT** replace `--alpha()` with `color-mix()` or `rgba()`. `--alpha()` is a native Tailwind v4 build-time function.

3. **Square Dimensions:**
   Use `size-*` for square icon or avatar sizing (e.g. `size-4`, `size-8`) instead of `w-4 h-4`.

4. **Logical Spacing:**
   Prefer logical spacing properties:
   - `ms-*` instead of `ml-*`
   - `me-*` instead of `mr-*`
   - `ps-*` instead of `pl-*`
   - `pe-*` instead of `pr-*`

5. **Data Slot Selectors:**
   Prefer data-slot selectors (`data-slot="..."` and `in-[[data-slot=button]:hover]`) over generic Tailwind `group` wrappers.

6. **Icon Conventions:**
   - Decorative icons must have `aria-hidden="true"`.
   - Do not pass numeric `size={16}` props to icons; let them inherit primitive sizing or apply `className="size-4"`.
