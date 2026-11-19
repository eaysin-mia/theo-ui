"use client";

import * as React from "react";
import type { ExtraProps } from "react-markdown";
import { useHighlightedCode } from "@theo/ui/hooks/use-highlighted-code";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@theo/ui/patterns/code-block";

export function MarkdownPre({
  node,
  children,
  ...props
}: React.ComponentProps<"pre"> & ExtraProps) {
  const element = node?.children?.[0];

  if (element?.type !== "element" || element.tagName !== "code") {
    return <pre {...props}>{children}</pre>;
  }

  const className = String(element.properties?.className ?? "");
  const match = /language-([^\s,]+)/.exec(className);
  const language = match?.[1] ?? "";

  const code = (element.children ?? [])
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("")
    .replace(/\n$/, "");

  return <MarkdownCodeBlock code={code} language={language} />;
}

export function MarkdownCodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const lines = useHighlightedCode(code, language || "typescript");

  return (
    <CodeBlock className="my-3">
      <CodeBlockHeader>
        <CodeBlockTitle>{language || "code"}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}
