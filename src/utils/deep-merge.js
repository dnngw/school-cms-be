const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Recursively merge `source` into `target` (returns a new object, arrays are replaced). */
export function deepMerge(target, source) {
  const output = { ...target };
  for (const [key, value] of Object.entries(source ?? {})) {
    output[key] =
      isPlainObject(value) && isPlainObject(target?.[key]) ? deepMerge(target[key], value) : value;
  }
  return output;
}
