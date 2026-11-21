export type DocHeading = {
  id: string;
  title: string;
  depth?: number;
};

export type DocEntry = {
  slug: string;
  title: string;
  description: string;
  section: string;
  keywords: string[];
  headings: DocHeading[];
};

export const docs: DocEntry[] = [
  {
    slug: "getting-started/introduction",
    title: "Introduction",
    description:
      "An overview of the Next.js documentation starter and its structure.",
    section: "Getting started",
    keywords: ["overview", "features", "app router", "markdown"],
    headings: [
      { id: "what-you-get", title: "What you get" },
      { id: "how-it-fits-together", title: "How it fits together" },
      { id: "start-here", title: "Start here" },
    ],
  },
  {
    slug: "getting-started/installation",
    title: "Installation",
    description:
      "Set up the project, run it locally, and add your first shadcn/ui component.",
    section: "Getting started",
    keywords: ["setup", "install", "pnpm", "development", "shadcn"],
    headings: [
      { id: "requirements", title: "Requirements" },
      { id: "set-up-the-project", title: "Set up the project" },
      { id: "add-a-shadcn-component", title: "Add a shadcn component" },
      { id: "run-the-development-server", title: "Run the development server" },
    ],
  },
  {
    slug: "customization/theme",
    title: "Theme and styling",
    description:
      "Customize the design tokens, typography, and light or dark appearance.",
    section: "Customization",
    keywords: ["css", "colors", "tokens", "dark mode", "tailwind"],
    headings: [
      { id: "design-tokens", title: "Design tokens" },
      { id: "light-and-dark-themes", title: "Light and dark themes" },
      { id: "typography-and-layout", title: "Typography and layout" },
    ],
  },
  {
    slug: "customization/writing-content",
    title: "Writing docs",
    description:
      "Create Markdown pages and make them available in navigation and search.",
    section: "Customization",
    keywords: ["content", "markdown", "mdx", "navigation", "search"],
    headings: [
      { id: "add-a-document", title: "Add a document" },
      { id: "make-it-discoverable", title: "Make it discoverable" },
      { id: "mdx-components", title: "MDX components" },
    ],
  },
  {
    slug: "components/index",
    title: "Components",
    description:
      "Use the existing shadcn/ui components and extend the component library.",
    section: "Components",
    keywords: ["shadcn", "ui", "registry", "components"],
    headings: [
      { id: "use-a-component", title: "Use a component" },
      { id: "add-more-components", title: "Add more components" },
      { id: "keep-components-local", title: "Keep components local" },
    ],
  },
  {
    slug: "components/button",
    title: "Button",
    description:
      "Use the starter's accessible button variants in links and actions.",
    section: "Components",
    keywords: ["button", "variants", "actions", "links"],
    headings: [
      { id: "button-variants", title: "Button variants" },
      { id: "use-buttons-for-actions", title: "Use buttons for actions" },
      { id: "use-links-for-navigation", title: "Use links for navigation" },
    ],
  },
];

const additionalDocs: Array<{
  slug: string;
  title: string;
  section: string;
  headings?: DocHeading[];
}> = [
  {
    slug: "prose-demo",
    title: "Prose demo",
    section: "Getting started",
  },
  {
    slug: "customization/customization",
    title: "Customization",
    section: "Customization",
  },
  {
    slug: "customization/mdx-components",
    title: "MDX components",
    section: "Customization",
  },
  {
    slug: "customization/hooks",
    title: "Hooks",
    section: "Customization",
  },
  {
    slug: "customization/writing-docs",
    title: "Writing docs",
    section: "Customization",
  },
  {
    slug: "components/doc-tabs",
    title: "Doc tabs",
    section: "Components",
    headings: [
      { id: "demo", title: "Demo", depth: 2 },
      { id: "usage", title: "Usage", depth: 2 },
      { id: "props", title: "Props", depth: 2 },
      { id: "doctabs", title: "DocTabs", depth: 3 },
      { id: "doctabslist", title: "DocTabsList", depth: 3 },
      { id: "doctabstrigger", title: "DocTabsTrigger", depth: 3 },
      { id: "doctabscontent", title: "DocTabsContent", depth: 3 },
      { id: "features", title: "Features", depth: 2 },
      { id: "examples", title: "Examples", depth: 2 },
      { id: "basic-tabs", title: "Basic Tabs", depth: 3 },
      {
        id: "with-codeblockcommand",
        title: "With CodeBlockCommand",
        depth: 3,
      },
      {
        id: "installation-guide-example",
        title: "Installation Guide Example",
        depth: 3,
      },
    ],
  },
  { slug: "components/callout", title: "Callout", section: "Components" },
  {
    slug: "components/component-preview",
    title: "Component preview",
    section: "Components",
  },
  {
    slug: "components/command-menu",
    title: "Command menu",
    section: "Components",
  },
  {
    slug: "components/copy-button",
    title: "Copy button",
    section: "Components",
  },
  {
    slug: "components/docs-sidebar",
    title: "Docs sidebar",
    section: "Components",
  },
  {
    slug: "components/docs-table-of-contents",
    title: "Docs table of contents",
    section: "Components",
  },
  {
    slug: "components/page-header",
    title: "Page header",
    section: "Components",
  },
  {
    slug: "components/site-header",
    title: "Site header",
    section: "Components",
  },
  {
    slug: "components/copy-code-button",
    title: "Copy code button",
    section: "Components",
  },
  {
    slug: "components/docs-copy-page",
    title: "Docs copy page",
    section: "Components",
  },
  {
    slug: "components/code-block-command",
    title: "Code block command",
    section: "Components",
  },
  {
    slug: "components/command-menu-item",
    title: "Command menu item",
    section: "Components",
  },
  {
    slug: "components/command-menu-kbd",
    title: "Command menu shortcut",
    section: "Components",
  },
  {
    slug: "components/github-link",
    title: "GitHub link",
    section: "Components",
  },
  {
    slug: "components/lucide-icon",
    title: "Lucide icon",
    section: "Components",
  },
  {
    slug: "components/main-nav",
    title: "Main navigation",
    section: "Components",
  },
  {
    slug: "components/mobile-nav",
    title: "Mobile navigation",
    section: "Components",
  },
  {
    slug: "components/mode-switcher",
    title: "Theme switcher",
    section: "Components",
  },
  {
    slug: "components/page-header-description",
    title: "Page header description",
    section: "Components",
  },
  {
    slug: "components/page-header-heading",
    title: "Page header heading",
    section: "Components",
  },
  {
    slug: "components/site-body",
    title: "Site body",
    section: "Components",
  },
  {
    slug: "components/site-config",
    title: "Site config",
    section: "Components",
  },
  {
    slug: "components/site-footer",
    title: "Site footer",
    section: "Components",
  },
  {
    slug: "components/og-image",
    title: "Open Graph image",
    section: "Components",
  },
];

docs.push(
  ...additionalDocs.map((doc) => ({
    ...doc,
    description: `Learn how to customize ${doc.title.toLowerCase()} for your documentation site.`,
    keywords: [doc.title.toLowerCase(), doc.section.toLowerCase(), "next.js"],
    headings: doc.headings ?? [
      { id: "overview", title: "Overview" },
      { id: "next-steps", title: "Next steps" },
    ],
  })),
);

export const docSections = [
  "Getting started",
  "Customization",
  "Components",
].map((title) => ({
  title,
  docs: docs.filter((doc) => doc.section === title),
}));

export function getDocHref(doc: DocEntry) {
  return `/docs/${doc.slug}`;
}

export function getDocBySlug(slug: string) {
  return docs.find((doc) => doc.slug === slug);
}
