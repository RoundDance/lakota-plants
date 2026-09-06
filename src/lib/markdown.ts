import { Marked } from 'marked';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Markdown only: raw HTML in these fields is shown as text, never rendered.
const md = new Marked({
  renderer: {
    html({ text }: { text: string }) {
      return escapeHtml(text);
    },
  },
});

/** Render Markdown stored in a plain string field (sources, credits) to HTML. */
export function renderMarkdown(text: string | undefined): string {
  if (!text || !text.trim()) return '';
  return md.parse(text, { async: false }) as string;
}
