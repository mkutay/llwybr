import Link from "next/link";
import type { MDXComponents } from "next-mdx-remote-client";
import type { MDXRemoteOptions } from "next-mdx-remote-client/rsc";
import type { ComponentProps, DetailedHTMLProps, HTMLAttributes } from "react";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkLint from "remark-lint";
import remarkMath from "remark-math";
import remarkSmartypants from "remark-smartypants";
import { cn } from "./utils";

type HeadingProps = DetailedHTMLProps<
  HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;

export const components: MDXComponents = {
  h1: ({ className, ...props }: HeadingProps) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-light lg:text-5xl my-10 first:my-0 first:mb-10 leading-tight",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: HeadingProps) => (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold mb-6 mt-10 border-border",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: HeadingProps) => (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-medium tracking-tight my-6",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: HeadingProps) => (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-medium tracking-tight my-4",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "leading-relaxed not-first:mt-6 md:text-lg text-base",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        "my-6 ml-6 list-disc space-y-2 **:[&_ul]:my-2 **:[&_ol]:my-2 **:[&_ul]:ml-8 **:[&_ol]:ml-8",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        "my-6 ml-6 list-decimal space-y-2 **:[&_ol]:my-2 **:[&_ul]:my-2 **:[&_ul]:ml-8 **:[&_ol]:ml-8",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("md:text-lg text-base", className)} {...props} />
  ),
  a: ({ className, ...props }: ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
        className,
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: HTMLAttributes<HTMLHRElement>) => (
    <hr className={cn("my-10 border-border", className)} {...props} />
  ),
};

export const options: MDXRemoteOptions = {
  mdxOptions: {
    baseUrl: import.meta.url,
    remarkPlugins: [remarkGfm, remarkLint, remarkMath, remarkSmartypants],
    rehypePlugins: [rehypeKatex],
  },
};
