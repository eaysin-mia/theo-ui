import { isValidElement, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

function getText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(children)) {
    return getText(children.props.children);
  }

  return "";
}

function getHeadingId(children: ReactNode) {
  return getText(children)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

const components: MDXComponents = {
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="font-medium underline underline-offset-4 hover:text-foreground"
    >
      {children}
    </a>
  ),
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      id={getHeadingId(children)}
      className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      id={getHeadingId(children)}
      className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p {...props} className="leading-7 [&:not(:first-child)]:mt-6">
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul {...props} className="my-6 ml-6 list-disc [&>li]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol {...props} className="my-6 ml-6 list-decimal [&>li]:mt-2">
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="mt-6 border-l-2 pl-6 text-muted-foreground italic"
    >
      {children}
    </blockquote>
  ),
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      className="my-6 overflow-x-auto rounded-lg border bg-muted p-4"
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => (
    <code
      {...props}
      className={`${className ?? ""} rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm`}
    >
      {children}
    </code>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table {...props} className="w-full">
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th {...props} className="border px-4 py-2 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td {...props} className="border px-4 py-2 text-left">
      {children}
    </td>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
