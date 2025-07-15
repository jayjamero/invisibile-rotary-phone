/**
 * Secure GraphQL Query Utilities
 * Provides secure wrappers and utilities for making GraphQL requests
 */

import { useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import {
    validateQuery,
    sanitizeVariables,
    checkRateLimit,
    sanitizeErrorMessage,
    maskResponseData,
    maskVariablesForLogging,
    maskQueryForLogging,
    createAuditLogData,
    DataMasker,
} from './graphql-security';
import { DocumentNode } from 'graphql';

export interface SecureQueryOptions {
    variables?: Record<string, unknown>;
    onError?: (error: string) => void;
    onRateLimit?: (resetTime: number) => void;
    validateInput?: boolean;
    context?: Record<string, unknown>;
    enableDataMasking?: boolean;
    enableAuditLogging?: boolean;
    customMasker?: DataMasker;
}

export interface SecureQueryResult<T> {
    data?: T;
    loading: boolean;
    error?: string;
    rateLimited: boolean;
    validationErrors: string[];
}

/**
 * Hook for making secure GraphQL queries with built-in validation and rate limiting
 */
export const useSecureGraphQLQuery = <T>(
    query: DocumentNode,
    options: SecureQueryOptions = {}
): SecureQueryResult<T> => {
    const [state, setState] = useState<SecureQueryResult<T>>({
        loading: false,
        error: undefined,
        rateLimited: false,
        validationErrors: [],
    });

    useEffect(() => {
        const executeQuery = async () => {
            setState((prev) => ({ ...prev, loading: true, error: undefined }));

            try {
                // Validate query structure
                const validation = validateQuery(query);
                if (!validation.valid) {
                    setState((prev) => ({
                        ...prev,
                        loading: false,
                        validationErrors: validation.errors,
                        error: 'Query validation failed',
                    }));

                    if (options.onError) {
                        options.onError('Query validation failed');
                    }
                    return;
                }

                // Check rate limiting
                const rateLimitCheck = checkRateLimit();
                if (!rateLimitCheck.allowed) {
                    setState((prev) => ({
                        ...prev,
                        loading: false,
                        rateLimited: true,
                        error: 'Rate limit exceeded',
                    }));

                    if (options.onRateLimit) {
                        options.onRateLimit(rateLimitCheck.resetTime);
                    }
                    return;
                }

                // Sanitize variables
                const sanitizedVariables = options.variables ? sanitizeVariables(options.variables) : {};

                // Apply data masking to variables for logging if enabled
                const maskedVariablesForLog =
                    options.enableAuditLogging !== false
                        ? maskVariablesForLogging(sanitizedVariables)
                        : sanitizedVariables;

                // Log query execution for audit purposes (with masked data)
                if (options.enableAuditLogging !== false && process.env.NODE_ENV !== 'test') {
                    console.log('Secure GraphQL Query Execution:', {
                        query: maskQueryForLogging(query),
                        variables: maskedVariablesForLog,
                        timestamp: new Date().toISOString(),
                        rateLimitRemaining: rateLimitCheck.remaining,
                    });
                }

                // Reset state for successful query
                setState((prev) => ({
                    ...prev,
                    rateLimited: false,
                    validationErrors: [],
                }));

                // Note: In a real implementation, you would execute the actual GraphQL query here
                // This is a utility that works alongside your existing Apollo Client setup
                if (process.env.NODE_ENV === 'development') {
                    console.log('Query would be executed with variables:', sanitizedVariables);
                }
            } catch (error) {
                const sanitizedError = sanitizeErrorMessage(error);
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: sanitizedError,
                }));

                if (options.onError) {
                    options.onError(sanitizedError);
                }
            }
        };

        if (query) {
            executeQuery();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, options.variables]);

    return state;
};

/**
 * Utility to create secure GraphQL query variables with data masking
 */
export const createSecureVariables = (variables: Record<string, unknown>): Record<string, unknown> => {
    return sanitizeVariables(variables);
};

/**
 * Utility to create masked variables for logging
 */
export const createMaskedVariables = (variables: Record<string, unknown>): Record<string, unknown> => {
    return maskVariablesForLogging(variables);
};

/**
 * Utility to mask GraphQL response data
 */
export const maskGraphQLResponse = <T>(data: T, enableMasking = true): T => {
    if (!enableMasking) {
        return data;
    }
    return maskResponseData(data);
};

/**
 * Utility to create audit-safe data for logging
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAuditSafeData = (data: any): any => {
    return createAuditLogData(data);
};

/**
 * Utility to create a secure data masker instance with custom configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSecureDataMasker = (config?: Partial<any>): DataMasker => {
    return new DataMasker(config);
};

/**
 * Utility to safely log GraphQL operations
 */
export const logSecureGraphQLOperation = (
    operation: string,
    query: DocumentNode,
    variables?: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any
): void => {
    if (process.env.NODE_ENV === 'test') {
        return; // Skip logging in tests
    }

    const logData = {
        operation,
        timestamp: new Date().toISOString(),
        query: maskQueryForLogging(query),
        variables: variables ? maskVariablesForLogging(variables) : undefined,
        result: result ? createAuditLogData(result) : undefined,
        error: error ? sanitizeErrorMessage(error) : undefined,
        environment: process.env.NODE_ENV,
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('GraphQL Operation Log:', logData);
    } else {
        // In production, you might want to send this to a secure logging service
        console.log('GraphQL Operation:', {
            operation: logData.operation,
            timestamp: logData.timestamp,
            hasError: !!error,
        });
    }
};

/**
 * Utility to handle GraphQL errors securely with data masking
 */
export const handleGraphQLError = (error: ApolloError, enableLogging = true): string => {
    let sanitizedErrorMessage: string;

    if (error.networkError) {
        sanitizedErrorMessage = sanitizeErrorMessage(error.networkError);
    } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        sanitizedErrorMessage = sanitizeErrorMessage(error.graphQLErrors[0]);
    } else {
        sanitizedErrorMessage = sanitizeErrorMessage(error);
    }

    // Log error for audit purposes with masking
    if (enableLogging) {
        logSecureGraphQLOperation(
            'ERROR_HANDLING',
            // Create a dummy query node for error logging
            { kind: 'Document', definitions: [] } as DocumentNode,
            undefined,
            undefined,
            error
        );
    }

    return sanitizedErrorMessage;
};

/**
 * Utility to check if a query is safe to execute with optional logging
 */
export const isQuerySafe = (query: DocumentNode, enableLogging = false): boolean => {
    const validation = validateQuery(query);
    if (!validation.valid) {
        if (enableLogging) {
            logSecureGraphQLOperation('QUERY_VALIDATION_FAILED', query, undefined, undefined, {
                message: `Validation failed: ${validation.errors.join(', ')}`,
            });
        }
        return false;
    }

    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        if (enableLogging) {
            logSecureGraphQLOperation('RATE_LIMIT_EXCEEDED', query, undefined, undefined, {
                message: 'Rate limit exceeded',
            });
        }
        return false;
    }

    return true;
};

/**
 * Configuration for secure GraphQL client with data masking options
 */
export const getSecureGraphQLConfig = () => ({
    maxQueryDepth: parseInt(process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH || '10'),
    maxQueryComplexity: parseInt(process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY || '1000'),
    requestTimeout: parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '10000'),
    rateLimit: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT || '60'),
    endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://rickandmortyapi.com/graphql',
    dataMasking: {
        enableMasking: process.env.NODE_ENV === 'production',
        enableAuditLogging: process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING !== 'false',
        logSafeMode: true,
        maskSensitiveFields: true,
    },
});

const secureQueryUtils = {
    useSecureGraphQLQuery,
    createSecureVariables,
    createMaskedVariables,
    maskGraphQLResponse,
    createAuditSafeData,
    createSecureDataMasker,
    logSecureGraphQLOperation,
    handleGraphQLError,
    isQuerySafe,
    getSecureGraphQLConfig,
};

export default secureQueryUtils;
