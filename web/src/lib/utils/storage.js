// web/src/lib/utils/storage.js
const STORAGE_PREFIX = 'cpq_';

export function persist(key, data) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to persist data:', e);
    }
}

export function recover(key) {
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn('Failed to recover data:', e);
        return null;
    }
}

export function clearStorage(key) {
    try {
        if (key) {
            localStorage.removeItem(STORAGE_PREFIX + key);
        } else {
            // Clear all CPQ data
            Object.keys(localStorage)
                .filter(k => k.startsWith(STORAGE_PREFIX))
                .forEach(k => localStorage.removeItem(k));
        }
    } catch (e) {
        console.warn('Failed to clear storage:', e);
    }
}