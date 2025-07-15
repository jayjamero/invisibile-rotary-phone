/**
 * GraphQL Security Utilities
 * Provides security measures for GraphQL requests including
 *             definitions: query.definitions.map((def) => ({
                kind: def.kind,
                // Only include operation type, not actual field names
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operation: (def as any).operation || 'unknown',
            })), validation, depth limiting, complexity analysis, and data masking
 */

import type { DocumentNode } from 'graphql';

// Security configuration from environment variables
const MAX_QUERY_DEPTH = parseInt(process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH || '10');
const MAX_QUERY_COMPLEXITY = parseInt(process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY || '1000');
const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '10000');
const RATE_LIMIT = parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT || '60');

// Data masking configuration
interface DataMaskingConfig {
    enableMasking: boolean;
    maskSensitiveFields: boolean;
    logSafeMode: boolean;
    maskingPattern: string;
    sensitiveFields: string[];
    partialMaskingFields: string[];
}

const DEFAULT_MASKING_CONFIG: DataMaskingConfig = {
    enableMasking: process.env.NODE_ENV === 'production',
    maskSensitiveFields: true,
    logSafeMode: true,
    maskingPattern: '***',
    sensitiveFields: ['id', 'created', 'dimension', 'episode.created', 'origin.id', 'location.id'],
    partialMaskingFields: ['name', 'image', 'air_date'],
};

// Rate limiting storage
interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

/**
 * Data masking utilities for GraphQL responses and variables
 */
export class DataMasker {
    private config: DataMaskingConfig;

    constructor(config: Partial<DataMaskingConfig> = {}) {
        this.config = { ...DEFAULT_MASKING_CONFIG, ...config };
    }

    /**
     * Masks sensitive fields in GraphQL response data
     */
    maskResponseData<T>(data: T): T {
        if (!this.config.enableMasking) {
            return data;
        }

        return this.deepMaskObject(data);
    }

    /**
     * Masks sensitive information in GraphQL variables for logging
     */
    maskVariables(variables: Record<string, unknown>): Record<string, unknown> {
        if (!this.config.logSafeMode) {
            return variables;
        }

        const masked: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(variables)) {
            if (this.isSensitiveField(key)) {
                masked[key] = this.config.maskingPattern;
            } else if (this.isPartialMaskingField(key) && typeof value === 'string') {
                masked[key] = this.partialMask(value);
            } else if (typeof value === 'object' && value !== null) {
                masked[key] = this.maskVariables(value as Record<string, unknown>);
            } else {
                masked[key] = value;
            }
        }

        return masked;
    }

    /**
     * Masks query content for logging purposes
     */
    maskQueryForLogging(query: DocumentNode): string {
        if (!this.config.logSafeMode) {
            return JSON.stringify(query);
        }

        // Create a safe representation of the query
        const safeQuery = {
            kind: query.kind,
            definitions: query.definitions?.map((def) => ({
                kind: def.kind,
                // Only include operation type, not actual field names
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operation: (def as any).operation || 'unknown',
            })),
        };

        return JSON.stringify(safeQuery);
    }

    /**
     * Masks error messages to prevent data leakage
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    maskErrorMessage(error: any): string {
        if (!this.config.enableMasking) {
            return error?.message || 'Unknown error';
        }

        const originalMessage = error?.message || '';

        // Remove any potential data that might be leaked in error messages
        let maskedMessage = originalMessage
            // Mask IDs that might appear in error messages
            .replace(/\b\d{1,6}\b/g, this.config.maskingPattern)
            // Mask URLs
            .replace(/https?:\/\/[^\s]+/g, '[MASKED_URL]')
            // Mask potential API keys or tokens
            .replace(/[a-zA-Z0-9]{20,}/g, '[MASKED_TOKEN]')
            // Mask email-like patterns
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[MASKED_EMAIL]');

        // Additional field-specific masking
        for (const field of this.config.sensitiveFields) {
            const regex = new RegExp(`${field}[:\\s"']*([^\\s"',}]+)`, 'gi');
            maskedMessage = maskedMessage.replace(regex, `${field}: ${this.config.maskingPattern}`);
        }

        return maskedMessage || 'An error occurred while processing your request.';
    }

    /**
     * Creates a sanitized version of response data for audit logging
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createAuditLogData(data: any): any {
        if (!this.config.logSafeMode) {
            return data;
        }

        return this.deepMaskObject(data, true);
    }

    private deepMaskObject<T>(obj: T, isAuditLog = false): T {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.deepMaskObject(item, isAuditLog)) as unknown as T;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const masked = { ...obj } as any;

        for (const [key, value] of Object.entries(masked)) {
            if (this.isSensitiveField(key)) {
                if (isAuditLog) {
                    // For audit logs, remove sensitive fields entirely
                    delete masked[key];
                } else {
                    masked[key] = this.config.maskingPattern;
                }
            } else if (this.isPartialMaskingField(key) && typeof value === 'string') {
                masked[key] = this.partialMask(value);
            } else if (typeof value === 'object' && value !== null) {
                masked[key] = this.deepMaskObject(value, isAuditLog);
            }
        }

        return masked;
    }

    private isSensitiveField(fieldName: string): boolean {
        return this.config.sensitiveFields.some(
            (field) =>
                fieldName.toLowerCase().includes(field.toLowerCase()) ||
                field.toLowerCase().includes(fieldName.toLowerCase())
        );
    }

    private isPartialMaskingField(fieldName: string): boolean {
        return this.config.partialMaskingFields.some((field) => fieldName.toLowerCase().includes(field.toLowerCase()));
    }

    private partialMask(value: string): string {
        if (value.length <= 4) {
            return this.config.maskingPattern;
        }

        const visibleChars = Math.max(1, Math.floor(value.length * 0.3));
        const start = value.substring(0, visibleChars);
        const end = value.substring(value.length - visibleChars);

        return `${start}${this.config.maskingPattern}${end}`;
    }
}

// Global data masker instance
const globalDataMasker = new DataMasker();

/**
 * Masks response data using the global masker
 */
export const maskResponseData = <T>(data: T): T => {
    return globalDataMasker.maskResponseData(data);
};

/**
 * Masks variables for logging using the global masker
 */
export const maskVariablesForLogging = (variables: Record<string, unknown>): Record<string, unknown> => {
    return globalDataMasker.maskVariables(variables);
};

/**
 * Masks query for logging using the global masker
 */
export const maskQueryForLogging = (query: DocumentNode): string => {
    return globalDataMasker.maskQueryForLogging(query);
};

/**
 * Creates audit log safe data using the global masker
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAuditLogData = (data: any): any => {
    return globalDataMasker.createAuditLogData(data);
};

/**
 * Simple query depth analyzer
 * Recursively analyzes GraphQL query depth to prevent deeply nested queries
 */
export const analyzeQueryDepth = (query: DocumentNode): number => {
    let maxDepth = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzeSelection = (selection: any, currentDepth: number): number => {
        let depth = currentDepth;

        if (selection.selectionSet) {
            const childDepth = Math.max(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...selection.selectionSet.selections.map((child: any) => analyzeSelection(child, currentDepth + 1))
            );
            depth = Math.max(depth, childDepth);
        }

        return depth;
    };

    if (query.definitions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query.definitions.forEach((definition: any) => {
            if (definition.selectionSet) {
                const depth = Math.max(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...definition.selectionSet.selections.map((selection: any) => analyzeSelection(selection, 1))
                );
                maxDepth = Math.max(maxDepth, depth);
            }
        });
    }

    return maxDepth;
};

/**
 * Simple query complexity analyzer
 * Estimates query complexity based on field count and nesting
 */
export const analyzeQueryComplexity = (query: DocumentNode): number => {
    let complexity = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzeSelection = (selection: any, multiplier: number = 1): number => {
        let selectionComplexity = multiplier;

        if (selection.selectionSet) {
            const childComplexity = selection.selectionSet.selections.reduce(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (sum: number, child: any) => sum + analyzeSelection(child, multiplier * 2),
                0
            );
            selectionComplexity += childComplexity;
        }

        return selectionComplexity;
    };

    if (query.definitions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query.definitions.forEach((definition: any) => {
            if (definition.selectionSet) {
                const defComplexity = definition.selectionSet.selections.reduce(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (sum: number, selection: any) => sum + analyzeSelection(selection),
                    0
                );
                complexity += defComplexity;
            }
        });
    }

    return complexity;
};

/**
 * Validates GraphQL query against security rules
 */
export const validateQuery = (query: DocumentNode): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    try {
        // Check query depth
        const depth = analyzeQueryDepth(query);
        if (depth > MAX_QUERY_DEPTH) {
            errors.push(`Query depth ${depth} exceeds maximum allowed depth of ${MAX_QUERY_DEPTH}`);
        }

        // Check query complexity
        const complexity = analyzeQueryComplexity(query);
        if (complexity > MAX_QUERY_COMPLEXITY) {
            errors.push(`Query complexity ${complexity} exceeds maximum allowed complexity of ${MAX_QUERY_COMPLEXITY}`);
        }

        // Validate query structure
        if (!query.definitions || query.definitions.length === 0) {
            errors.push('Query must contain at least one definition');
        }
    } catch {
        errors.push('Failed to analyze query structure');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Rate limiting implementation
 * Tracks requests per IP/identifier and enforces limits
 */
export const checkRateLimit = (
    identifier: string = 'default'
): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    let rateLimitInfo = rateLimitMap.get(identifier);

    // Reset if window has passed
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
        rateLimitInfo = {
            count: 0,
            resetTime: now + windowMs,
        };
    }

    // Check if limit exceeded
    if (rateLimitInfo.count >= RATE_LIMIT) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: rateLimitInfo.resetTime,
        };
    }

    // Increment counter
    rateLimitInfo.count++;
    rateLimitMap.set(identifier, rateLimitInfo);

    return {
        allowed: true,
        remaining: RATE_LIMIT - rateLimitInfo.count,
        resetTime: rateLimitInfo.resetTime,
    };
};

/**
 * Sanitizes GraphQL variables to prevent injection attacks
 * Now uses data masking for enhanced security
 */
export const sanitizeVariables = (variables: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(variables)) {
        if (value === null || value === undefined) {
            sanitized[key] = value;
            continue;
        }

        if (typeof value === 'string') {
            // Basic string sanitization - remove potential script injections
            sanitized[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        } else if (typeof value === 'number') {
            // Validate numbers
            if (isFinite(value) && !isNaN(value)) {
                sanitized[key] = value;
            } else {
                sanitized[key] = 0;
            }
        } else if (typeof value === 'boolean') {
            sanitized[key] = Boolean(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item) => (typeof item === 'string' ? sanitizeVariables({ item }).item : item));
        } else if (typeof value === 'object') {
            sanitized[key] = sanitizeVariables(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Creates secure headers for GraphQL requests
 */
export const createSecureHeaders = (): Record<string, string> => {
    return {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',
        // XSS protection
        'X-XSS-Protection': '1; mode=block',
    };
};

/**
 * Sanitizes error messages to prevent information disclosure
 * Uses advanced data masking for comprehensive protection
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeErrorMessage = (error: any): string => {
    if (process.env.NODE_ENV === 'development') {
        // In development, still apply basic masking but show more details
        return globalDataMasker.maskErrorMessage(error);
    }

    // Use the data masker for comprehensive error message sanitization
    const maskedMessage = globalDataMasker.maskErrorMessage(error);

    // In production, return generic error messages for known patterns
    const genericMessages: Record<string, string> = {
        'Network error': 'Unable to connect to the service. Please try again later.',
        'GraphQL error': 'There was an issue processing your request.',
        Timeout: 'Request timed out. Please try again.',
        'Rate limit': 'Too many requests. Please wait before trying again.',
    };

    const errorMessage = error?.message || '';

    // Check for known error patterns first
    for (const [pattern, message] of Object.entries(genericMessages)) {
        if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
            return message;
        }
    }

    return maskedMessage;
};

export { MAX_QUERY_DEPTH, MAX_QUERY_COMPLEXITY, REQUEST_TIMEOUT, RATE_LIMIT };
