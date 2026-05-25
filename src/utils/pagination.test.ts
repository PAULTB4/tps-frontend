import { describe, it, expect } from 'vitest';
import { extractRows, extractMeta, cleanParams } from './pagination';

describe('extractRows', () => {
  it('should return the array directly when payload is an array', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    expect(extractRows(arr)).toEqual(arr);
  });

  it('should extract .data when present', () => {
    expect(extractRows({ data: [{ id: 1 }] })).toEqual([{ id: 1 }]);
  });

  it('should extract .items as fallback', () => {
    expect(extractRows({ items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
  });

  it('should prefer .data over .items', () => {
    expect(extractRows({ data: [{ id: 1 }], items: [{ id: 2 }] })).toEqual([{ id: 1 }]);
  });

  it('should return empty array for null/undefined/primitive', () => {
    expect(extractRows(null)).toEqual([]);
    expect(extractRows(undefined)).toEqual([]);
    expect(extractRows(42)).toEqual([]);
    expect(extractRows('hello')).toEqual([]);
  });
});

describe('extractMeta', () => {
  it('should extract meta from nested .meta object', () => {
    expect(extractMeta({ meta: { total: 100, page: 2, limit: 20, totalPages: 5 } })).toEqual({
      total: 100,
      page: 2,
      limit: 20,
      totalPages: 5,
    });
  });

  it('should extract meta from flat object when total or page is meaningful', () => {
    expect(extractMeta({ total: 50, page: 1, limit: 10 })).toEqual({
      total: 50,
      page: 1,
      limit: 10,
      totalPages: 5,
    });
  });

  it('should return undefined when no meaningful pagination info exists', () => {
    expect(extractMeta({})).toBeUndefined();
    expect(extractMeta({ total: 0, page: 1, limit: 20 })).toBeUndefined();
  });

  it('should calculate totalPages when omitted', () => {
    expect(extractMeta({ total: 45, page: 1, limit: 20 })).toEqual({
      total: 45,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
  });

  it('should default totalPages to 1 when total is 0', () => {
    expect(extractMeta({ total: 0, page: 1, limit: 20 })).toBeUndefined();
  });

  it('should return undefined for null/undefined/primitive', () => {
    expect(extractMeta(null)).toBeUndefined();
    expect(extractMeta(undefined)).toBeUndefined();
    expect(extractMeta(42)).toBeUndefined();
  });
});

describe('cleanParams', () => {
  it('should remove empty strings, undefined, and null values', () => {
    expect(cleanParams({ a: '1', b: '', c: undefined, d: null, e: 0 })).toEqual({ a: '1', e: 0 });
  });

  it('should return undefined when all values are empty', () => {
    expect(cleanParams({ a: '', b: undefined })).toBeUndefined();
  });

  it('should return undefined when input is undefined', () => {
    expect(cleanParams(undefined)).toBeUndefined();
  });

  it('should keep valid numbers and strings', () => {
    expect(cleanParams({ page: 1, limit: '20' })).toEqual({ page: 1, limit: '20' });
  });
});
