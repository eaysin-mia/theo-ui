# Next Docs

A documentation starter using the Next.js App Router, MDX, Tailwind CSS, and shadcn/ui.

## Development

```bash
pnpm install
pnpm dev
```

## Add shadcn/ui components

Generate components into the local UI library with the shadcn CLI:

```bash
pnpm exec shadcn add command dialog input kbd separator sheet sidebar tooltip
```

Import generated components from `@/components/ui`.

## Add documentation pages

Write page content as MDX under `content/docs`, then add the route metadata to `lib/docs.ts` and map the file in `app/docs/[...slug]/page.tsx`. The document index drives the sidebar, search, table of contents, and page navigation.
