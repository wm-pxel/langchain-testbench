import { intersection, union, difference, deepEquals } from './sets';

describe('sets', () => {
  describe('intersection', () => {
    it('should return the intersection of two sets', () => {
      expect(intersection(new Set([1, 2, 3]), new Set([2, 3, 4]))).toEqual(new Set([2, 3]));
    });
  })

  describe('union', () => {
    it('should return the union of two sets', () => {
      expect(union(new Set([1, 2, 3]), new Set([2, 3, 4]))).toEqual(new Set([1, 2, 3, 4]));
    });
  })

  describe('difference', () => {
    it('should return the difference of two sets', () => {
      expect(difference(new Set([1, 2, 3]), new Set([2, 3, 4]))).toEqual(new Set([1]));
    });
  })

  describe('deepEquals', () => {
    it('should return true for equal objects', () => {
      expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('should return false for unequal objects', () => {
      expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });

    it('should return true for equal arrays', () => {
      expect(deepEquals([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('should return false for unequal arrays', () => {
      expect(deepEquals([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should return true for equal mixed objects', () => {
      expect(deepEquals({ a: 1, b: [1, 2, 3] }, { a: 1, b: [1, 2, 3] })).toBe(true);
    });

    it('should return false for unequal mixed objects', () => {
      expect(deepEquals({ a: 1, b: [1, 2, 3] }, { a: 1, b: [1, 2, 4] })).toBe(false);
    });
  });
});
