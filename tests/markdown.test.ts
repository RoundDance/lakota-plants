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
