import { marked } from 'marked';

/** Render Markdown stored in a plain string field (sources, credits) to HTML. */
export function renderMarkdown(text: string | undefined): string {
  if (!text || !text.trim()) return '';
  return marked.parse(text, { async: false }) as string;
}
