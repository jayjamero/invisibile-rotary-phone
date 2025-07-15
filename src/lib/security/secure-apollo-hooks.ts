/**
 * Secure Apoimport {
    maskGraphQLResponse,
    logSecureGraphQLOperation,
    isQuerySafe,
    handleGraphQLError,
    createAuditSafeData
} from './secure-query-utils';nt Hooks with Data Masking
 * Provides React hooks that integrate Apollo Client with comprehensive data masking
 */

import { useEffect, useState, useCallback } from 'react';
import {
    useQuery,
    useLazyQuery,
    useMutation,
    QueryHookOptions,
    LazyQueryHookOptions,
    MutationHookOptions,
    OperationVariables,
    ApolloError,
} from '@apollo/client';
import { DocumentNode } from 'graphql';
import {
    maskGraphQLResponse,
    logSecureGraphQLOperation,
    isQuerySafe,
    handleGraphQLError,
    createAuditSafeData,
} from './secure-query-utils';

export interface SecureQueryHookOptions<TVariables extends OperationVariables = OperationVariables>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extends QueryHookOptions<any, TVariables> {
    enableDataMasking?: boolean;
    enableAuditLogging?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customMaskingConfig?: any;
}

export interface SecureLazyQueryHookOptions<TVariables extends OperationVariables = OperationVariables>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extends LazyQueryHookOptions<any, TVariables> {
    enableDataMasking?: boolean;
    enableAuditLogging?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customMaskingConfig?: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SecureMutationHookOptions<TData = any, TVariables = OperationVariables>
    extends MutationHookOptions<TData, TVariables> {
    enableDataMasking?: boolean;
    enableAuditLogging?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customMaskingConfig?: any;
}

/**
 * Secure version of useQuery with built-in data masking
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSecureQuery = <TData = any, TVariables extends OperationVariables = OperationVariables>(
    query: DocumentNode,
    options: SecureQueryHookOptions<TVariables> = {}
) => {
    const {
        enableDataMasking = true,
        enableAuditLogging = process.env.NODE_ENV !== 'test',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        customMaskingConfig,
        ...apolloOptions
    } = options;

    // Check if query is safe before executing
    const [isQueryValid, setIsQueryValid] = useState<boolean>(true);

    useEffect(() => {
        const queryValid = isQuerySafe(query, enableAuditLogging);
        setIsQueryValid(queryValid);

        if (!queryValid && enableAuditLogging) {
            logSecureGraphQLOperation('UNSAFE_QUERY_BLOCKED', query, apolloOptions.variables, undefined, {
                message: 'Query blocked due to security validation failure',
            });
        }
    }, [query, apolloOptions.variables, enableAuditLogging]);

    const { data, loading, error, ...apolloResult } = useQuery<TData, TVariables>(query, {
        ...apolloOptions,
        skip: apolloOptions.skip || !isQueryValid,
        onCompleted: (data) => {
            if (enableAuditLogging) {
                logSecureGraphQLOperation('QUERY_COMPLETED', query, apolloOptions.variables, data);
            }
            apolloOptions.onCompleted?.(data);
        },
        onError: (error) => {
            if (enableAuditLogging) {
                logSecureGraphQLOperation('QUERY_ERROR', query, apolloOptions.variables, undefined, error);
            }
            apolloOptions.onError?.(error);
        },
    });

    // Apply data masking to response
    const maskedData = enableDataMasking && data ? maskGraphQLResponse(data) : data;

    // Provide masked error message
    const secureError = error ? handleGraphQLError(error, enableAuditLogging) : undefined;

    return {
        data: maskedData,
        loading,
        error: secureError ? ({ message: secureError } as ApolloError) : undefined,
        isQueryValid,
        ...apolloResult,
    };
};

/**
 * Secure version of useLazyQuery with built-in data masking
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSecureLazyQuery = <TData = any, TVariables extends OperationVariables = OperationVariables>(
    query: DocumentNode,
    options: SecureLazyQueryHookOptions<TVariables> = {}
) => {
    const {
        enableDataMasking = true,
        enableAuditLogging = process.env.NODE_ENV !== 'test',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        customMaskingConfig,
        ...apolloOptions
    } = options;

    const [executeLazyQuery, { data, loading, error, ...apolloResult }] = useLazyQuery<TData, TVariables>(query, {
        ...apolloOptions,
        onCompleted: (data) => {
            if (enableAuditLogging) {
                logSecureGraphQLOperation('LAZY_QUERY_COMPLETED', query, apolloOptions.variables, data);
            }
            apolloOptions.onCompleted?.(data);
        },
        onError: (error) => {
            if (enableAuditLogging) {
                logSecureGraphQLOperation('LAZY_QUERY_ERROR', query, apolloOptions.variables, undefined, error);
            }
            apolloOptions.onError?.(error);
        },
    });

    const secureExecuteLazyQuery = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (executeOptions?: any) => {
            const queryValid = isQuerySafe(query, enableAuditLogging);

            if (!queryValid) {
                if (enableAuditLogging) {
                    logSecureGraphQLOperation(
                        'UNSAFE_LAZY_QUERY_BLOCKED',
                        query,
                        executeOptions?.variables,
                        undefined,
                        { message: 'Lazy query blocked due to security validation failure' }
                    );
                }
                return;
            }

            return executeLazyQuery(executeOptions);
        },
        [executeLazyQuery, query, enableAuditLogging]
    );

    // Apply data masking to response
    const maskedData = enableDataMasking && data ? maskGraphQLResponse(data) : data;

    // Provide masked error message
    const secureError = error ? handleGraphQLError(error, enableAuditLogging) : undefined;

    return [
        secureExecuteLazyQuery,
        {
            data: maskedData,
            loading,
            error: secureError ? ({ message: secureError } as ApolloError) : undefined,
            ...apolloResult,
        },
    ] as const;
};

/**
 * Secure version of useMutation with built-in data masking
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSecureMutation = <TData = any, TVariables extends OperationVariables = OperationVariables>(
    mutation: DocumentNode,
    options: SecureMutationHookOptions<TData, TVariables> = {}
) => {
    const {
        enableDataMasking = true,
        enableAuditLogging = process.env.NODE_ENV !== 'test',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        customMaskingConfig,
        ...apolloOptions
    } = options;

    const [executeMutation, { data, loading, error, ...apolloResult }] = useMutation<TData, TVariables>(mutation, {
        ...apolloOptions,
        onCompleted: (data) => {
            if (enableAuditLogging) {
                logSecureGraphQLOperation('MUTATION_COMPLETED', mutation, apolloOptions.variables, data);
            }
            apolloOptions.onCompleted?.(data);
        },
        onError: (error) => {
            if (enableAuditLogging) {
                logSecureGraphQLOperation('MUTATION_ERROR', mutation, apolloOptions.variables, undefined, error);
            }
            apolloOptions.onError?.(error);
        },
    });

    const secureExecuteMutation = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (executeOptions?: any) => {
            const queryValid = isQuerySafe(mutation, enableAuditLogging);

            if (!queryValid) {
                if (enableAuditLogging) {
                    logSecureGraphQLOperation(
                        'UNSAFE_MUTATION_BLOCKED',
                        mutation,
                        executeOptions?.variables,
                        undefined,
                        { message: 'Mutation blocked due to security validation failure' }
                    );
                }
                throw new Error('Mutation blocked due to security validation failure');
            }

            return executeMutation(executeOptions);
        },
        [executeMutation, mutation, enableAuditLogging]
    );

    // Apply data masking to response
    const maskedData = enableDataMasking && data ? maskGraphQLResponse(data) : data;

    // Provide masked error message
    const secureError = error ? handleGraphQLError(error, enableAuditLogging) : undefined;

    return [
        secureExecuteMutation,
        {
            data: maskedData,
            loading,
            error: secureError ? ({ message: secureError } as ApolloError) : undefined,
            ...apolloResult,
        },
    ] as const;
};

/**
 * Utility hook to create audit logs for GraphQL operations
 */
export const useGraphQLAuditLogger = () => {
    const logOperation = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (operation: string, query: DocumentNode, variables?: any, result?: any, error?: any) => {
            logSecureGraphQLOperation(operation, query, variables, result, error);
        },
        []
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createAuditLog = useCallback((data: any) => {
        return createAuditSafeData(data);
    }, []);

    return {
        logOperation,
        createAuditLog,
    };
};

const secureApolloHooks = {
    useSecureQuery,
    useSecureLazyQuery,
    useSecureMutation,
    useGraphQLAuditLogger,
};

export default secureApolloHooks;
