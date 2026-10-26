import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashString,
  isValidHttpUrl,
  isValidIsoDate,
  normalizeGNewsArticles,
  resolveStableId,
} from '../src/normalize.ts';

describe('normalize module', () => {
  describe('isValidHttpUrl', () => {
    it('accepts valid http and https URLs', () => {
      assert.equal(isValidHttpUrl('https://example.com/football/article-1'), true);
      assert.equal(isValidHttpUrl('http://news.bbc.co.uk/sport'), true);
      assert.equal(isValidHttpUrl('https://sub.domain.org/path?query=val#hash'), true);
    });

    it('rejects unsafe and non-http schemes', () => {
      assert.equal(isValidHttpUrl('javascript:alert(1)'), false);
      assert.equal(isValidHttpUrl('data:text/html;base64,PHNjcmlwdD4='), false);
      assert.equal(isValidHttpUrl('file:///etc/passwd'), false);
      assert.equal(isValidHttpUrl('ftp://example.com/file'), false);
      assert.equal(isValidHttpUrl('/relative/path'), false);
      assert.equal(isValidHttpUrl('not-a-url'), false);
      assert.equal(isValidHttpUrl(''), false);
      assert.equal(isValidHttpUrl(null), false);
      assert.equal(isValidHttpUrl(undefined), false);
    });
  });

  describe('isValidIsoDate', () => {
    it('validates ISO-8601 timestamps', () => {
      assert.equal(isValidIsoDate('2026-10-25T14:30:00Z'), true);
      assert.equal(isValidIsoDate('2026-10-25T14:30:00.000Z'), true);
      assert.equal(isValidIsoDate('2026-10-25'), true);
    });

    it('rejects invalid dates and non-string inputs', () => {
      assert.equal(isValidIsoDate('not-a-date'), false);
      assert.equal(isValidIsoDate(''), false);
      assert.equal(isValidIsoDate(null), false);
      assert.equal(isValidIsoDate(12345), false);
    });
  });

  describe('resolveStableId and hashString', () => {
    it('preserves valid provider id if present', () => {
      assert.equal(resolveStableId('custom-id-123', 'https://example.com/article'), 'custom-id-123');
      assert.equal(resolveStableId(4567, 'https://example.com/article'), '4567');
    });

    it('generates deterministic stable hash when provider id is missing', () => {
      const url = 'https://example.com/football/arsenal-chelsea';
      const id1 = resolveStableId(undefined, url);
      const id2 = resolveStableId(null, url);
      const id3 = resolveStableId('', url);

      assert.equal(id1, id2);
      assert.equal(id2, id3);
      assert.match(id1, /^gnews-[a-f0-9]{8}$/);
    });

    it('hashString is consistent across calls', () => {
      assert.equal(hashString('test-string'), hashString('test-string'));
      assert.notEqual(hashString('string-a'), hashString('string-b'));
    });
  });

  describe('normalizeGNewsArticles', () => {
    it('normalizes valid GNews articles accurately', () => {
      const raw = [
        {
          id: 'art-001',
          title: 'Arsenal claim victory in thrilling derby',
          description: 'A comprehensive tactical analysis of Sunday’s match.',
          url: 'https://news.example.com/derby-report',
          image: 'https://images.example.com/stadium.jpg',
          publishedAt: '2026-10-25T16:00:00Z',
          source: {
            name: 'BBC Sport',
            url: 'https://bbc.com',
          },
        },
      ];

      const normalized = normalizeGNewsArticles(raw);
      assert.equal(normalized.length, 1);
      assert.deepEqual(normalized[0], {
        id: 'art-001',
        title: 'Arsenal claim victory in thrilling derby',
        source: 'BBC Sport',
        publishedAt: '2026-10-25T16:00:00.000Z',
        summary: 'A comprehensive tactical analysis of Sunday’s match.',
        url: 'https://news.example.com/derby-report',
        imageUrl: 'https://images.example.com/stadium.jpg',
      });
    });

    it('rejects entries with missing title', () => {
      const raw = [
        {
          url: 'https://example.com/no-title',
          publishedAt: '2026-10-25T10:00:00Z',
        },
        {
          title: '   ',
          url: 'https://example.com/whitespace-title',
          publishedAt: '2026-10-25T10:00:00Z',
        },
      ];
      assert.deepEqual(normalizeGNewsArticles(raw), []);
    });

    it('rejects entries with invalid or unsafe URLs', () => {
      const raw = [
        {
          title: 'Malicious Article',
          url: 'javascript:alert(1)',
          publishedAt: '2026-10-25T10:00:00Z',
        },
        {
          title: 'Relative URL Article',
          url: '/path/to/story',
          publishedAt: '2026-10-25T10:00:00Z',
        },
      ];
      assert.deepEqual(normalizeGNewsArticles(raw), []);
    });

    it('rejects entries with invalid publishedAt timestamps', () => {
      const raw = [
        {
          title: 'Invalid Date Article',
          url: 'https://example.com/invalid-date',
          publishedAt: 'invalid-date-string',
        },
      ];
      assert.deepEqual(normalizeGNewsArticles(raw), []);
    });

    it('omits invalid image URLs while preserving valid articles', () => {
      const raw = [
        {
          id: 'art-no-image',
          title: 'Article with bad image URL',
          url: 'https://example.com/article-1',
          image: 'javascript:alert(1)',
          publishedAt: '2026-10-25T12:00:00Z',
        },
      ];
      const normalized = normalizeGNewsArticles(raw);
      assert.equal(normalized.length, 1);
      assert.equal(normalized[0].imageUrl, undefined);
    });

    it('handles empty, null, or malformed article collections', () => {
      assert.deepEqual(normalizeGNewsArticles([]), []);
      assert.deepEqual(normalizeGNewsArticles(null), []);
      assert.deepEqual(normalizeGNewsArticles(undefined), []);
      assert.deepEqual(normalizeGNewsArticles('not-an-array'), []);
      assert.deepEqual(normalizeGNewsArticles([null, undefined, 42, 'string']), []);
    });

    it('falls back to default source name when publisher source is missing', () => {
      const raw = [
        {
          title: 'Premier League weekend roundup',
          url: 'https://example.com/roundup',
          publishedAt: '2026-10-25T12:00:00Z',
        },
      ];
      const normalized = normalizeGNewsArticles(raw);
      assert.equal(normalized.length, 1);
      assert.equal(normalized[0].source, 'Football News');
    });
  });
});
