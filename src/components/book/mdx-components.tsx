import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Table({
  className,
  ...props
}: React.ComponentProps<"table">) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
      <table
        className={cn(
          "w-full border-collapse text-sm",
          className
        )}
        {...props}
      />
    </div>
  );
}

function Thead({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn("bg-muted/50 dark:bg-muted/30", className)}
      {...props}
    />
  );
}

function Th({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border-b border-border px-4 py-2.5 text-left font-semibold text-foreground",
        className
      )}
      {...props}
    />
  );
}

function Td({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-b border-border/50 px-4 py-2.5 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function Tr({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-muted/30 dark:hover:bg-muted/20",
        className
      )}
      {...props}
    />
  );
}

function Blockquote({
  className,
  ...props
}: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "my-6 border-l-4 border-blue-500/60 bg-blue-50/50 py-3 pl-5 pr-4 text-[0.95em] italic text-muted-foreground dark:border-blue-400/40 dark:bg-blue-950/20",
        "[&>p]:my-1",
        className
      )}
      {...props}
    />
  );
}

function Strong({ className, ...props }: React.ComponentProps<"strong">) {
  return (
    <strong
      className={cn(
        "font-bold text-foreground",
        className
      )}
      {...props}
    />
  );
}

function H2({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "mb-4 mt-10 scroll-mt-20 border-b border-border/60 pb-2 text-xl font-bold tracking-tight text-foreground first:mt-0",
        className
      )}
      {...props}
    />
  );
}

function H3({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "mb-3 mt-8 scroll-mt-20 text-lg font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function Paragraph({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("mb-6 leading-[1.9]", className)}
      {...props}
    />
  );
}

function Hr({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      className={cn(
        "my-8 border-t border-border/60",
        className
      )}
      {...props}
    />
  );
}

function Ul({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "my-4 ml-6 list-disc space-y-2 text-muted-foreground [&>li]:leading-[1.8]",
        className
      )}
      {...props}
    />
  );
}

function Ol({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "my-4 ml-6 list-decimal space-y-2 text-muted-foreground [&>li]:leading-[1.8]",
        className
      )}
      {...props}
    />
  );
}

function Anchor({
  className,
  href,
  ...props
}: React.ComponentProps<"a">) {
  // If it's an internal entity link
  if (href && (href.startsWith("/explore/") || href.startsWith("/book/"))) {
    return (
      <Link
        href={href}
        className={cn(
          "font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-600/60 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:text-blue-300",
          className
        )}
        {...props}
      />
    );
  }

  return (
    <a
      href={href}
      className={cn(
        "font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-600/60 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:text-blue-300",
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}

/**
 * Callout component for key insights.
 * Usage in MDX: <Callout type="info">content</Callout>
 */
function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200",
    warning:
      "border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200",
    danger:
      "border-red-500/40 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200",
  };

  const icons = {
    info: "💡",
    warning: "⚠️",
    danger: "🚨",
  };

  return (
    <div
      className={cn(
        "my-6 rounded-lg border-l-4 px-5 py-4 text-[0.95em] leading-[1.8]",
        styles[type]
      )}
    >
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

/**
 * EntityLink for inline clickable links to explore pages.
 * Usage in MDX: <EntityLink type="target" id="nvidia">NVIDIA</EntityLink>
 */
function EntityLink({
  type = "target",
  id,
  children,
}: {
  type?: "target" | "layer";
  id: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/explore/${type}/${id}`}
      className="inline-flex items-center gap-0.5 rounded-sm bg-blue-50 px-1.5 py-0.5 text-[0.92em] font-medium text-blue-700 no-underline transition-colors hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
    >
      {children}
    </Link>
  );
}

export function getBookMdxComponents(): MDXComponents {
  return {
    table: Table,
    thead: Thead,
    th: Th,
    td: Td,
    tr: Tr,
    blockquote: Blockquote,
    strong: Strong,
    h2: H2,
    h3: H3,
    p: Paragraph,
    hr: Hr,
    ul: Ul,
    ol: Ol,
    a: Anchor,
    Callout,
    EntityLink,
  };
}
