/**
 * Unit tests for Secure Query Utilities
 */

import { ApolloError } from '@apollo/client';
import { DocumentNode } from 'graphql';
import {
    createSecureVariables,
    handleGraphQLError,
    isQuerySafe,
    getSecureGraphQLConfig,
    maskGraphQLResponse,
    createMaskedVariables,
    createAuditSafeData,
    logSecureGraphQLOperation,
    createSecureDataMasker,
} from '../secure-query-utils';

// Mock the graphql-security module
jest.mock('../graphql-security', () => ({
    validateQuery: jest.fn(),
    sanitizeVariables: jest.fn(),
    checkRateLimit: jest.fn(),
    sanitizeErrorMessage: jest.fn(),
    maskResponseData: jest.fn(),
    maskVariablesForLogging: jest.fn(),
    maskQueryForLogging: jest.fn(),
    createAuditLogData: jest.fn(),
    DataMasker: jest.fn().mockImplementation(() => ({
        maskResponseData: jest.fn(),
        maskVariables: jest.fn(),
        maskQueryForLogging: jest.fn(),
        maskErrorMessage: jest.fn(),
        createAuditLogData: jest.fn(),
    })),
}));

import {
    validateQuery,
    sanitizeVariables,
    checkRateLimit,
    sanitizeErrorMessage,
    maskResponseData,
    maskVariablesForLogging,
    maskQueryForLogging,
    createAuditLogData,
} from '../graphql-security';

const mockValidateQuery = validateQuery as jest.MockedFunction<typeof validateQuery>;
const mockSanitizeVariables = sanitizeVariables as jest.MockedFunction<typeof sanitizeVariables>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockSanitizeErrorMessage = sanitizeErrorMessage as jest.MockedFunction<typeof sanitizeErrorMessage>;
const mockMaskResponseData = maskResponseData as jest.MockedFunction<typeof maskResponseData>;
const mockMaskVariablesForLogging = maskVariablesForLogging as jest.MockedFunction<typeof maskVariablesForLogging>;
const mockMaskQueryForLogging = maskQueryForLogging as jest.MockedFunction<typeof maskQueryForLogging>;
const mockCreateAuditLogData = createAuditLogData as jest.MockedFunction<typeof createAuditLogData>;

// Mock query for testing
const mockQuery: DocumentNode = {
    kind: 'Document',
    definitions: [
        {
            kind: 'OperationDefinition',
            operation: 'query',
            selectionSet: {
                kind: 'SelectionSet',
                selections: [
                    {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'characters' },
                    },
                ],
            },
        },
    ],
} as unknown as DocumentNode;

describe('Secure Query Utilities', () => {
    // Store original environment values
    const originalDepth = process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH;
    const originalComplexity = process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY;
    const originalTimeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
    const originalRateLimit = process.env.NEXT_PUBLIC_RATE_LIMIT;
    const originalEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Set default mock behaviors
        mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
        mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 50, resetTime: Date.now() + 60000 });
        mockSanitizeVariables.mockImplementation((vars) => vars);
        mockSanitizeErrorMessage.mockImplementation((error) => error?.message || 'Unknown error');
        mockMaskResponseData.mockImplementation((data) => data);
        mockMaskVariablesForLogging.mockImplementation((vars) => vars);
        mockMaskQueryForLogging.mockImplementation((query) => JSON.stringify(query));
        mockCreateAuditLogData.mockImplementation((data) => data);
    });

    afterAll(() => {
        // Restore original environment values
        process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH = originalDepth;
        process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY = originalComplexity;
        process.env.NEXT_PUBLIC_REQUEST_TIMEOUT = originalTimeout;
        process.env.NEXT_PUBLIC_RATE_LIMIT = originalRateLimit;
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = originalEndpoint;
    });

    describe('createSecureVariables', () => {
        it('calls sanitizeVariables with provided variables', () => {
            const variables = { name: 'Rick', age: 70 };
            const sanitized = { name: 'Rick', age: 70 };

            mockSanitizeVariables.mockReturnValue(sanitized);

            const result = createSecureVariables(variables);

            expect(mockSanitizeVariables).toHaveBeenCalledWith(variables);
            expect(result).toEqual(sanitized);
        });

        it('handles empty variables', () => {
            const variables = {};
            mockSanitizeVariables.mockReturnValue({});

            const result = createSecureVariables(variables);

            expect(result).toEqual({});
        });

        it('handles complex nested variables', () => {
            const variables = {
                filter: {
                    name: 'Rick',
                    species: 'Human',
                },
                pagination: {
                    page: 1,
                    limit: 20,
                },
            };

            mockSanitizeVariables.mockReturnValue(variables);

            const result = createSecureVariables(variables);

            expect(mockSanitizeVariables).toHaveBeenCalledWith(variables);
            expect(result).toEqual(variables);
        });
    });

    describe('handleGraphQLError', () => {
        it('handles network errors', () => {
            const networkError = new Error('Network connection failed');
            const apolloError = new ApolloError({
                networkError,
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized network error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(networkError);
            expect(result).toBe('Sanitized network error');
        });

        it('handles GraphQL errors', () => {
            const graphQLError = { message: 'Field not found' };
            const apolloError = new ApolloError({
                graphQLErrors: [graphQLError],
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized GraphQL error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(graphQLError);
            expect(result).toBe('Sanitized GraphQL error');
        });

        it('handles general Apollo errors', () => {
            const apolloError = new ApolloError({
                errorMessage: 'General Apollo error',
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized general error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(apolloError);
            expect(result).toBe('Sanitized general error');
        });

        it('prioritizes network errors over GraphQL errors', () => {
            const networkError = new Error('Network error');
            const graphQLError = { message: 'GraphQL error' };
            const apolloError = new ApolloError({
                networkError,
                graphQLErrors: [graphQLError],
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized network error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(networkError);
            expect(result).toBe('Sanitized network error');
        });

        it('handles empty GraphQL errors array', () => {
            const apolloError = new ApolloError({
                graphQLErrors: [],
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized general error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(apolloError);
            expect(result).toBe('Sanitized general error');
        });

        it('handles multiple GraphQL errors by taking the first one', () => {
            const graphQLError1 = { message: 'First error' };
            const graphQLError2 = { message: 'Second error' };
            const apolloError = new ApolloError({
                graphQLErrors: [graphQLError1, graphQLError2],
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized first error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(graphQLError1);
            expect(result).toBe('Sanitized first error');
        });
    });

    describe('isQuerySafe', () => {
        it('returns true for valid queries within rate limits', () => {
            mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
            mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 50, resetTime: Date.now() + 60000 });

            const result = isQuerySafe(mockQuery);

            expect(result).toBe(true);
            expect(mockValidateQuery).toHaveBeenCalledWith(mockQuery);
            expect(mockCheckRateLimit).toHaveBeenCalled();
        });

        it('returns false for invalid queries', () => {
            mockValidateQuery.mockReturnValue({ valid: false, errors: ['Query too deep'] });
            mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 50, resetTime: Date.now() + 60000 });

            const result = isQuerySafe(mockQuery);

            expect(result).toBe(false);
        });

        it('returns false when rate limited', () => {
            mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
            mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetTime: Date.now() + 30000 });

            const result = isQuerySafe(mockQuery);

            expect(result).toBe(false);
        });

        it('returns false when both validation fails and rate limited', () => {
            mockValidateQuery.mockReturnValue({ valid: false, errors: ['Query too deep'] });
            mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetTime: Date.now() + 30000 });

            const result = isQuerySafe(mockQuery);

            expect(result).toBe(false);
        });

        it('calls validation and rate limiting functions', () => {
            mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
            mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 50, resetTime: Date.now() + 60000 });

            isQuerySafe(mockQuery);

            expect(mockValidateQuery).toHaveBeenCalledTimes(1);
            expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
        });
    });

    describe('getSecureGraphQLConfig', () => {
        it('returns default configuration when environment variables are not set', () => {
            // Clear environment variables
            delete process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH;
            delete process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY;
            delete process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
            delete process.env.NEXT_PUBLIC_RATE_LIMIT;
            delete process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

            const config = getSecureGraphQLConfig();

            expect(config).toEqual({
                maxQueryDepth: 10,
                maxQueryComplexity: 1000,
                requestTimeout: 10000,
                rateLimit: 60,
                endpoint: 'https://rickandmortyapi.com/graphql',
                dataMasking: {
                    enableMasking: process.env.NODE_ENV === 'production',
                    enableAuditLogging: true,
                    logSafeMode: true,
                    maskSensitiveFields: true,
                },
            });
        });

        it('uses environment variables when set', () => {
            process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH = '5';
            process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY = '500';
            process.env.NEXT_PUBLIC_REQUEST_TIMEOUT = '5000';
            process.env.NEXT_PUBLIC_RATE_LIMIT = '30';
            process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT = 'https://custom-api.com/graphql';

            const config = getSecureGraphQLConfig();

            expect(config).toEqual({
                maxQueryDepth: 5,
                maxQueryComplexity: 500,
                requestTimeout: 5000,
                rateLimit: 30,
                endpoint: 'https://custom-api.com/graphql',
                dataMasking: {
                    enableMasking: process.env.NODE_ENV === 'production',
                    enableAuditLogging: true,
                    logSafeMode: true,
                    maskSensitiveFields: true,
                },
            });
        });

        it('parses string environment variables to numbers', () => {
            process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH = '15';

            const config = getSecureGraphQLConfig();

            expect(typeof config.maxQueryDepth).toBe('number');
            expect(config.maxQueryDepth).toBe(15);
        });

        it('handles invalid environment variable values gracefully', () => {
            process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH = 'invalid';

            const config = getSecureGraphQLConfig();

            // parseInt should return NaN for invalid strings
            expect(config.maxQueryDepth).toBe(NaN);
        });

        it('returns all required configuration properties', () => {
            const config = getSecureGraphQLConfig();

            expect(config).toHaveProperty('maxQueryDepth');
            expect(config).toHaveProperty('maxQueryComplexity');
            expect(config).toHaveProperty('requestTimeout');
            expect(config).toHaveProperty('rateLimit');
            expect(config).toHaveProperty('endpoint');
        });

        it('uses default endpoint when not set', () => {
            delete process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

            const config = getSecureGraphQLConfig();

            expect(config.endpoint).toBe('https://rickandmortyapi.com/graphql');
        });
    });

    describe('edge cases', () => {
        it('handles null/undefined in createSecureVariables', () => {
            mockSanitizeVariables.mockReturnValue({});

            const result1 = createSecureVariables({});
            expect(result1).toEqual({});

            // Test with variables containing null/undefined
            const variables = { name: null, age: undefined };
            mockSanitizeVariables.mockReturnValue(variables);

            createSecureVariables(variables);
            expect(mockSanitizeVariables).toHaveBeenCalledWith(variables);
        });

        it('handles Apollo errors without network or GraphQL errors', () => {
            const apolloError = new ApolloError({});

            mockSanitizeErrorMessage.mockReturnValue('Generic error');

            const result = handleGraphQLError(apolloError);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(apolloError);
            expect(result).toBe('Generic error');
        });

        it('handles complex GraphQL queries in isQuerySafe', () => {
            const complexQuery = {
                ...mockQuery,
                definitions: [
                    ...mockQuery.definitions,
                    {
                        kind: 'OperationDefinition',
                        operation: 'mutation',
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [],
                        },
                    },
                ],
            } as DocumentNode;

            mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
            mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 50, resetTime: Date.now() + 60000 });

            const result = isQuerySafe(complexQuery);

            expect(result).toBe(true);
            expect(mockValidateQuery).toHaveBeenCalledWith(complexQuery);
        });
    });

    describe('Data Masking Functions', () => {
        describe('maskGraphQLResponse', () => {
            it('masks response data when masking is enabled', () => {
                const responseData = { id: '123', name: 'Rick Sanchez' };
                const maskedData = { id: '***', name: 'Ric***hez' };

                mockMaskResponseData.mockReturnValue(maskedData);

                const result = maskGraphQLResponse(responseData, true);

                expect(mockMaskResponseData).toHaveBeenCalledWith(responseData);
                expect(result).toEqual(maskedData);
            });

            it('returns original data when masking is disabled', () => {
                const responseData = { id: '123', name: 'Rick Sanchez' };

                const result = maskGraphQLResponse(responseData, false);

                expect(mockMaskResponseData).not.toHaveBeenCalled();
                expect(result).toEqual(responseData);
            });
        });

        describe('createMaskedVariables', () => {
            it('creates masked variables for logging', () => {
                const variables = { name: 'Rick', dimension: 'C-137' };
                const maskedVariables = { name: 'Ric***', dimension: '***' };

                mockMaskVariablesForLogging.mockReturnValue(maskedVariables);

                const result = createMaskedVariables(variables);

                expect(mockMaskVariablesForLogging).toHaveBeenCalledWith(variables);
                expect(result).toEqual(maskedVariables);
            });
        });

        describe('createAuditSafeData', () => {
            it('creates audit-safe data by removing sensitive fields', () => {
                const data = { id: '123', name: 'Rick', created: '2023-01-01' };
                const auditSafeData = { name: 'Rick' }; // sensitive fields removed

                mockCreateAuditLogData.mockReturnValue(auditSafeData);

                const result = createAuditSafeData(data);

                expect(mockCreateAuditLogData).toHaveBeenCalledWith(data);
                expect(result).toEqual(auditSafeData);
            });
        });

        describe('logSecureGraphQLOperation', () => {
            it('logs operations with masked data in development', () => {
                const originalEnv = process.env.NODE_ENV;
                Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

                const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

                mockMaskQueryForLogging.mockReturnValue('masked_query');
                mockMaskVariablesForLogging.mockReturnValue({ name: 'Ric***' });
                mockCreateAuditLogData.mockReturnValue({ result: 'masked' });

                logSecureGraphQLOperation('TEST_OPERATION', mockQuery, { name: 'Rick' }, { result: 'success' });

                expect(consoleSpy).toHaveBeenCalled();
                expect(mockMaskQueryForLogging).toHaveBeenCalledWith(mockQuery);
                expect(mockMaskVariablesForLogging).toHaveBeenCalledWith({ name: 'Rick' });

                consoleSpy.mockRestore();
                Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
            });

            it('logs minimal data in production', () => {
                const originalEnv = process.env.NODE_ENV;
                Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

                const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

                logSecureGraphQLOperation(
                    'TEST_OPERATION',
                    mockQuery,
                    { name: 'Rick' },
                    undefined,
                    new Error('Test error')
                );

                expect(consoleSpy).toHaveBeenCalledWith('GraphQL Operation:', {
                    operation: 'TEST_OPERATION',
                    timestamp: expect.any(String),
                    hasError: true,
                });

                consoleSpy.mockRestore();
                Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true });
            });

            it('skips logging in test environment', () => {
                const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

                logSecureGraphQLOperation('TEST_OPERATION', mockQuery);

                expect(consoleSpy).not.toHaveBeenCalled();

                consoleSpy.mockRestore();
            });
        });
        describe('createSecureDataMasker', () => {
            it('creates a DataMasker instance with custom config', () => {
                const customConfig = { maskingPattern: '###' };

                const masker = createSecureDataMasker(customConfig);

                // Check that the function returns something (mocked DataMasker)
                expect(masker).toBeDefined();
                expect(typeof masker).toBe('object');
            });
        });
    });

    describe('Enhanced Error Handling with Data Masking', () => {
        it('handles Apollo errors with audit logging enabled', () => {
            const apolloError = new ApolloError({
                networkError: new Error('Network error with sensitive data: user_id_123'),
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized network error');

            const result = handleGraphQLError(apolloError, true);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(apolloError.networkError);
            expect(result).toBe('Sanitized network error');
        });

        it('handles Apollo errors with audit logging disabled', () => {
            const apolloError = new ApolloError({
                graphQLErrors: [{ message: 'GraphQL error with data' }],
            });

            mockSanitizeErrorMessage.mockReturnValue('Sanitized GraphQL error');

            const result = handleGraphQLError(apolloError, false);

            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(apolloError.graphQLErrors[0]);
            expect(result).toBe('Sanitized GraphQL error');
        });
    });

    describe('Enhanced Query Safety with Logging', () => {
        it('returns true for safe queries with logging disabled', () => {
            mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
            mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 50, resetTime: Date.now() + 60000 });

            const result = isQuerySafe(mockQuery, false);

            expect(result).toBe(true);
            expect(mockValidateQuery).toHaveBeenCalledWith(mockQuery);
            expect(mockCheckRateLimit).toHaveBeenCalled();
        });

        it('returns false for unsafe queries and logs the issue', () => {
            mockValidateQuery.mockReturnValue({ valid: false, errors: ['Query too deep'] });

            const result = isQuerySafe(mockQuery, true);

            expect(result).toBe(false);
        });

        it('returns false when rate limited and logs the issue', () => {
            mockValidateQuery.mockReturnValue({ valid: true, errors: [] });
            mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetTime: Date.now() + 30000 });

            const result = isQuerySafe(mockQuery, true);

            expect(result).toBe(false);
        });
    });

    describe('Enhanced Configuration with Data Masking', () => {
        it('returns configuration with data masking options', () => {
            const originalAuditLogging = process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING;
            process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING = 'true';

            const config = getSecureGraphQLConfig();

            expect(config).toEqual({
                maxQueryDepth: expect.any(Number),
                maxQueryComplexity: expect.any(Number),
                requestTimeout: expect.any(Number),
                rateLimit: expect.any(Number),
                endpoint: expect.any(String),
                dataMasking: {
                    enableMasking: process.env.NODE_ENV === 'production',
                    enableAuditLogging: true,
                    logSafeMode: true,
                    maskSensitiveFields: true,
                },
            });

            process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING = originalAuditLogging;
        });

        it('defaults audit logging to true when environment variable is not set', () => {
            const originalAuditLogging = process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING;
            delete process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING;

            const config = getSecureGraphQLConfig();

            expect(config.dataMasking.enableAuditLogging).toBe(true);

            process.env.NEXT_PUBLIC_ENABLE_AUDIT_LOGGING = originalAuditLogging;
        });
    });
});
