// web/src/lib/utils/sanitizer.js

/**
 * Check if a string contains code patterns
 */
export function containsCode(text) {
    if (typeof text !== 'string') return false;

    const codePatterns = [
        '=>',              // Arrow functions
        'function',        // Function keyword
        '$props',         // Svelte internals
        '$',              // Any Svelte internal
        '$.strict_equals', // Svelte runtime
        'return ',         // Return statements
        '${',              // Template literals
        '() =>',           // Arrow function pattern
        '} else',          // Control flow
        'if (',            // Conditionals
        '.selection_type',  // Property access that looks like code
        'strict_equals',   // Function names
        'min_selections',  // When preceded by dots
        'max_selections',  // When preceded by dots
    ];

    return codePatterns.some(pattern => text.includes(pattern));
}

/**
 * Sanitize text by removing code patterns
 */
export function sanitizeText(text, fallback = '') {
    // Handle non-string inputs
    if (text === null || text === undefined) return fallback;

    // Convert to string if needed
    const textStr = String(text);

    // Check if it's already a normal string
    if (typeof text === 'string' && !containsCode(textStr)) {
        return textStr;
    }

    // Log when we detect code
    if (containsCode(textStr)) {
        console.warn('[Sanitizer] Code pattern detected and removed:', {
            original: textStr.substring(0, 100) + (textStr.length > 100 ? '...' : ''),
            fallback: fallback
        });
        return fallback;
    }

    return textStr;
}

/**
 * Sanitize an entire object recursively
 */
export function sanitizeObject(obj, fields = ['name', 'description', 'label', 'title', 'text', 'value']) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, fields));
    }

    const sanitized = { ...obj };

    // Check all string properties, not just specific fields
    Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string') {
            const original = sanitized[key];
            const cleaned = sanitizeText(original, '');
            if (original !== cleaned) {
                console.warn(`[Sanitizer] Cleaned field '${key}' in object`);
                sanitized[key] = cleaned;
            }
        } else if (sanitized[key] && typeof sanitized[key] === 'object') {
            // Recursively sanitize nested objects
            sanitized[key] = sanitizeObject(sanitized[key], fields);
        }
    });

    return sanitized;
}

/**
 * Create a safe text getter
 */
export function safeText(getValue, fallback = '') {
    try {
        const value = typeof getValue === 'function' ? getValue() : getValue;
        return sanitizeText(String(value), fallback);
    } catch (error) {
        console.error('[Sanitizer] Error in safeText:', error);
        return fallback;
    }
}

/**
 * Debug helper to check if an object contains code
 */
export function debugCheckForCode(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string' && containsCode(value)) {
            console.error(`[Sanitizer] Code found at ${currentPath}:`, value);
        } else if (value && typeof value === 'object') {
            debugCheckForCode(value, currentPath);
        }
    });
}