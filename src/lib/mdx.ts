import { compileMDX } from 'next-mdx-remote/rsc';
import type { MDXComponents } from 'mdx/types';

/**
 * Render raw MDX source string into a React element.
 * Frontmatter parsing is skipped since we handle that separately with gray-matter.
 * Accepts optional custom components to override default HTML elements.
 */
export async function renderMdx(
  source: string,
  components?: MDXComponents
) {
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: false },
    components,
  });
  return content;
}
