// frontend/src/utils/arrayUtils.js
// Utility functions for safe array operations

/**
 * Ensures a value is an array, returning an empty array if not
 * @param {any} value - The value to check
 * @param {Array} fallback - Fallback array to use (defaults to empty array)
 * @returns {Array} - Safe array to use
 */
export const ensureArray = (value, fallback = []) => {
  return Array.isArray(value) ? value : fallback;
};

/**
 * Safely applies array methods without throwing errors
 * @param {any} value - The value to check
 * @returns {Object} - Object with safe array methods
 */
export const safeArray = (value) => {
  const arr = ensureArray(value);
  
  return {
    map: (fn) => arr.map(fn),
    filter: (fn) => arr.filter(fn),
    find: (fn) => arr.find(fn),
    some: (fn) => arr.some(fn),
    every: (fn) => arr.every(fn),
    reduce: (fn, initial) => arr.reduce(fn, initial),
    length: arr.length,
    isEmpty: () => arr.length === 0,
    isNotEmpty: () => arr.length > 0,
    get: () => arr
  };
};

export default { ensureArray, safeArray };