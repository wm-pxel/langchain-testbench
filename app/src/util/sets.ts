export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const difference = new Set<T>();
  for (const item of a) if (!b.has(item)) difference.add(item);
  return difference;
}

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const intersection = new Set<T>();
  for (const item of a) if (b.has(item)) intersection.add(item);
  return intersection;
}

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const union = new Set<T>();
  for (const item of a) union.add(item);
  for (const item of b) union.add(item);
  return union;
}

export const deepEquals = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;

  if (typeof a === 'object') {
    if (typeof b !== 'object') return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEquals(a[key], b[key])) return false;
    }
  } else if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (!deepEquals(a[i], b[i])) return false;
    }
  } else {
    if (a !== b) return false;
  }

  return true;
}
