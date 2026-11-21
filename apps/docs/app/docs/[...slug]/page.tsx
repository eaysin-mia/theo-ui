import type { Metadata } from "next";
import type { MDXContent } from "mdx/types";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { notFound } from "next/navigation";

import { CopyPageButton } from "@/components/copy-page-button";
import { DocsTableOfContents } from "@/components/docs-table-of-contents";
import { docs, getDocBySlug, getDocHref, type DocEntry } from "@/lib/docs";
import { Button } from "@/components/ui/button";

import ButtonDocs from "@/content/docs/components/button.mdx";
import ComponentsDocs from "@/content/docs/components/index.mdx";
import DocTabsDocs from "@/content/docs/components/doc-tabs.mdx";
import IntroductionDocs from "@/content/docs/getting-started/introduction.mdx";
import InstallationDocs from "@/content/docs/getting-started/installation.mdx";
import ThemeDocs from "@/content/docs/customization/theme.mdx";
import WritingDocs from "@/content/docs/customization/writing-content.mdx";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const contentBySlug: Record<string, MDXContent> = {
  "getting-started/introduction": IntroductionDocs,
  "getting-started/installation": InstallationDocs,
  "customization/theme": ThemeDocs,
  "customization/writing-content": WritingDocs,
  "components/index": ComponentsDocs,
  "components/doc-tabs": DocTabsDocs,
  "components/button": ButtonDocs,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));

  return doc
    ? { title: doc.title, description: doc.description }
    : { title: "Not found" };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));
  const Content = contentBySlug[slug.join("/")];

  if (!doc) {
    notFound();
  }

  const currentIndex = docs.findIndex((entry) => entry.slug === doc.slug);
  const previous = docs[currentIndex - 1];
  const next = docs[currentIndex + 1];

  return (
    <div
      data-slot="docs"
      className="flex h-full items-stretch text-[1.05rem] sm:text-[15px] xl:w-full"
    >
      <div className="flex h-auto min-w-0 flex-1 flex-col">
        <div className="h-4 shrink-0" />
        <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-foreground md:px-0 lg:py-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <h1 className="flex scroll-m-20 items-center gap-3 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                  <BookOpenText className="size-8 shrink-0 text-muted-foreground sm:size-7 xl:size-8" />
                  {doc.title}
                </h1>

                <div className="fixed inset-x-0 bottom-0 isolate z-50 flex items-center gap-2 border-t border-border/50 bg-background/80 px-6 py-4 backdrop-blur-sm sm:static sm:z-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pt-1.5 sm:backdrop-blur-none">
                  <CopyPageButton />
                  {previous && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="ms-auto size-8 shadow-none md:size-7"
                      nativeButton={false}
                      render={<Link href={getDocHref(previous)} />}
                    >
                      <ArrowLeft />
                      <span className="sr-only">Previous page</span>
                    </Button>
                  )}
                  {next && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-8 shadow-none md:size-7"
                      nativeButton={false}
                      render={<Link href={getDocHref(next)} />}
                    >
                      <span className="sr-only">Next page</span>
                      <ArrowRight />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[1.05rem] text-balance text-muted-foreground sm:text-base">
                {doc.description}
              </p>
            </div>
          </div>

          <div className="w-full flex-1">
            {Content ? <Content /> : <TemplateDocContent doc={doc} />}
          </div>
        </div>

        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-2 px-4 md:px-0">
          {previous && (
            <Button
              variant="secondary"
              size="sm"
              className="shadow-none"
              nativeButton={false}
              render={<Link href={getDocHref(previous)} />}
            >
              <ChevronLeft />
              {previous.title}
            </Button>
          )}
          {next && (
            <Button
              variant="secondary"
              size="sm"
              className="ms-auto shadow-none"
              nativeButton={false}
              render={<Link href={getDocHref(next)} />}
            >
              {next.title}
              <ChevronRight />
            </Button>
          )}
        </div>
      </div>

      <aside className="sticky top-16 z-30 ms-auto hidden h-[calc(100svh-8rem)] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-4 shrink-0" />
        <div className="overflow-y-auto px-8">
          <DocsTableOfContents headings={doc.headings} />
          <div className="h-12" />
        </div>
      </aside>
    </div>
  );
}

function TemplateDocContent({ doc }: { doc: DocEntry }) {
  return (
    <>
      <h2
        id="overview"
        className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight"
      >
        Overview
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">{doc.description}</p>
      <h2
        id="next-steps"
        className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight"
      >
        Next steps
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Add examples and project-specific guidance here when you customize this
        page.
      </p>
    </>
  );
}
