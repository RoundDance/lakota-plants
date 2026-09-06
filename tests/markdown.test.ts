import { describe, expect, test } from 'vitest';
import { renderMarkdown } from '../src/lib/markdown';

describe('renderMarkdown', () => {
  test('renders paragraphs and links', () => {
    const html = renderMarkdown('Hello *there*.\n\n[A link](https://example.com)');
    expect(html).toContain('<em>there</em>');
    expect(html).toContain('<a href="https://example.com">A link</a>');
  });

  test('returns an empty string for missing text', () => {
    expect(renderMarkdown(undefined)).toBe('');
    expect(renderMarkdown('   ')).toBe('');
  });
});

describe('renderMarkdown safety', () => {
  test('escapes raw HTML instead of passing it through', () => {
    const html = renderMarkdown('Hi <script>alert(1)</script> <b>there</b>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;script&gt;');
  });
});
