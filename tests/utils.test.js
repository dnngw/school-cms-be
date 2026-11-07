import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../src/utils/api-error.js';
import { deepMerge } from '../src/utils/deep-merge.js';
import { sanitizeRichText } from '../src/utils/sanitize.js';
import { slugify } from '../src/utils/slug.js';

describe('slugify', () => {
  it('creates url friendly slugs', () => {
    assert.equal(slugify('Berita Terbaru Hari Ini!'), 'berita-terbaru-hari-ini');
    assert.equal(slugify('  Visi & Misi  '), 'visi-and-misi');
  });
});

describe('deepMerge', () => {
  it('merges nested objects without mutating the target', () => {
    const defaults = { colors: { primary: '#000', secondary: '#111' }, radius: 'md' };
    const result = deepMerge(defaults, { colors: { primary: '#fff' } });

    assert.deepEqual(result, { colors: { primary: '#fff', secondary: '#111' }, radius: 'md' });
    assert.equal(defaults.colors.primary, '#000');
  });

  it('replaces arrays instead of merging them', () => {
    assert.deepEqual(deepMerge({ items: [1, 2] }, { items: [3] }), { items: [3] });
  });
});

describe('sanitizeRichText', () => {
  it('removes scripts and event handlers', () => {
    const html = sanitizeRichText('<p onclick="x()">Hi<script>alert(1)</script></p>');
    assert.equal(html, '<p>Hi</p>');
  });

  it('only allows iframes from trusted video hosts', () => {
    assert.match(
      sanitizeRichText('<iframe src="https://www.youtube.com/embed/abc"></iframe>'),
      /youtube/,
    );
    assert.doesNotMatch(sanitizeRichText('<iframe src="https://evil.com"></iframe>'), /evil/);
  });
});

describe('ApiError', () => {
  it('sets status and default code', () => {
    const error = ApiError.notFound();
    assert.equal(error.statusCode, 404);
    assert.equal(error.code, 'NOT_FOUND');
  });
});
