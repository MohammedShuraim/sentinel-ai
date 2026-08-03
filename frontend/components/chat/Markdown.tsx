"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => (
    <h1 className="mb-2.5 mt-5 font-display text-lg font-semibold tracking-tight text-fg first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2.5 mt-5 border-b border-line/60 pb-1.5 font-display text-base font-semibold tracking-tight text-fg first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 font-display text-sm font-semibold tracking-tight text-fg first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1.5 mt-3.5 text-sm font-semibold text-fg first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2.5 leading-[1.75] first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2.5 list-disc space-y-1.5 pl-5 marker:text-ai/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 list-decimal space-y-1.5 pl-5 marker:font-medium marker:text-ai/60">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:text-brand-strong hover:decoration-brand"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="tnum font-semibold text-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children, className }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded-md border border-line bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-brand">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3.5 overflow-x-auto rounded-xl border border-line bg-elevated/80 p-4 font-mono text-xs leading-relaxed text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3.5 rounded-r-xl border-l-2 border-ai/50 bg-ai-soft/25 py-1.5 pl-4 pr-3 text-fg-muted [&>p]:leading-relaxed">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-5 border-0 bg-gradient-to-r from-transparent via-line-strong to-transparent" style={{ height: 1 }} />
  ),
  table: ({ children }) => (
    <div className="my-3.5 overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-elevated/80 text-left">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-line px-3.5 py-2.5 font-semibold uppercase tracking-wider text-fg-muted">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="tnum border-b border-line/60 px-3.5 py-2.5 align-top leading-relaxed text-fg-muted">
      {children}
    </td>
  ),
};

export const Markdown = memo(function Markdown({
  content,
}: {
  content: string;
}) {
  return (
    <div className="text-sm text-fg">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
