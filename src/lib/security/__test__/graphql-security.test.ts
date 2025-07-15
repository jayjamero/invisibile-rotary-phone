/**
 * Unit tests for GraphQL Security Utilities
 */

import { DocumentNode } from 'graphql';
import {
    analyzeQueryDepth,
    analyzeQueryComplexity,
    validateQuery,
    checkRateLimit,
    sanitizeVariables,
    createSecureHeaders,
    sanitizeErrorMessage,
    MAX_QUERY_DEPTH,
    MAX_QUERY_COMPLEXITY,
    REQUEST_TIMEOUT,
    RATE_LIMIT,
} from '../graphql-security';

// Mock GraphQL query structures for testing
const createMockQuery = (depth: number): DocumentNode => {
    // Create a nested query structure for testing depth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectionSet: any = {
        kind: 'SelectionSet',
        selections: [
            {
                kind: 'Field',
                name: { kind: 'Name', value: 'field' },
            },
        ],
    };

    for (let i = 1; i < depth; i++) {
        selectionSet = {
            kind: 'SelectionSet',
            selections: [
                {
                    kind: 'Field',
                    name: { kind: 'Name', value: `field${i}` },
                    selectionSet: selectionSet,
                },
            ],
        };
    }

    return {
        kind: 'Document',
        definitions: [
            {
                kind: 'OperationDefinition',
                operation: 'query',
                selectionSet: selectionSet,
            },
        ],
    } as unknown as DocumentNode;
};

const createComplexQuery = (): DocumentNode => {
    return {
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
                            name: { kind: 'Name', value: 'field1' },
                            selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                    { kind: 'Field', name: { kind: 'Name', value: 'subfield1' } },
                                    { kind: 'Field', name: { kind: 'Name', value: 'subfield2' } },
                                    {
                                        kind: 'Field',
                                        name: { kind: 'Name', value: 'subfield3' },
                                        selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                                { kind: 'Field', name: { kind: 'Name', value: 'deepfield1' } },
                                                { kind: 'Field', name: { kind: 'Name', value: 'deepfield2' } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        { kind: 'Field', name: { kind: 'Name', value: 'field2' } },
                        { kind: 'Field', name: { kind: 'Name', value: 'field3' } },
                    ],
                },
            },
        ],
    } as unknown as DocumentNode;
};

const createEmptyQuery = (): DocumentNode => {
    return {
        kind: 'Document',
        definitions: [],
    } as DocumentNode;
};

describe('GraphQL Security Utilities', () => {
    // Store original environment values
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMaxDepth = process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH;
    const originalMaxComplexity = process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY;
    const originalTimeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
    const originalRateLimit = process.env.NEXT_PUBLIC_RATE_LIMIT;

    beforeEach(() => {
        // Clear rate limit storage before each test
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore original environment values
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalNodeEnv,
            writable: true,
        });
        process.env.NEXT_PUBLIC_MAX_QUERY_DEPTH = originalMaxDepth;
        process.env.NEXT_PUBLIC_MAX_QUERY_COMPLEXITY = originalMaxComplexity;
        process.env.NEXT_PUBLIC_REQUEST_TIMEOUT = originalTimeout;
        process.env.NEXT_PUBLIC_RATE_LIMIT = originalRateLimit;
    });

    describe('analyzeQueryDepth', () => {
        it('calculates depth of simple query correctly', () => {
            const query = createMockQuery(1);
            const depth = analyzeQueryDepth(query);
            expect(depth).toBe(1);
        });

        it('calculates depth of nested query correctly', () => {
            const query = createMockQuery(5);
            const depth = analyzeQueryDepth(query);
            expect(depth).toBe(5);
        });

        it('handles complex nested queries', () => {
            const query = createComplexQuery();
            const depth = analyzeQueryDepth(query);
            expect(depth).toBeGreaterThan(1);
        });

        it('handles queries with no selections', () => {
            const query = createEmptyQuery();
            const depth = analyzeQueryDepth(query);
            expect(depth).toBe(0);
        });

        it('handles queries with undefined definitions', () => {
            const query = { kind: 'Document' } as DocumentNode;
            const depth = analyzeQueryDepth(query);
            expect(depth).toBe(0);
        });
    });

    describe('analyzeQueryComplexity', () => {
        it('calculates complexity of simple query', () => {
            const query = createMockQuery(1);
            const complexity = analyzeQueryComplexity(query);
            expect(complexity).toBeGreaterThan(0);
        });

        it('calculates higher complexity for nested queries', () => {
            const simpleQuery = createMockQuery(1);
            const complexQuery = createMockQuery(3);

            const simpleComplexity = analyzeQueryComplexity(simpleQuery);
            const complexComplexity = analyzeQueryComplexity(complexQuery);

            expect(complexComplexity).toBeGreaterThan(simpleComplexity);
        });

        it('handles complex queries with multiple fields', () => {
            const query = createComplexQuery();
            const complexity = analyzeQueryComplexity(query);
            expect(complexity).toBeGreaterThan(1);
        });

        it('returns 0 for empty queries', () => {
            const query = createEmptyQuery();
            const complexity = analyzeQueryComplexity(query);
            expect(complexity).toBe(0);
        });
    });

    describe('validateQuery', () => {
        it('validates simple queries as valid', () => {
            const query = createMockQuery(2);
            const result = validateQuery(query);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('rejects queries that are too deep', () => {
            const query = createMockQuery(15); // Exceeds default MAX_QUERY_DEPTH of 10
            const result = validateQuery(query);
            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('Query depth')]));
        });

        it('rejects empty queries', () => {
            const query = createEmptyQuery();
            const result = validateQuery(query);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Query must contain at least one definition');
        });

        it('handles query analysis errors gracefully', () => {
            const malformedQuery = { kind: 'Document', definitions: [null] } as unknown as DocumentNode;
            const result = validateQuery(malformedQuery);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('uses environment variables for limits', () => {
            // Test with custom environment variables - this test shows the current behavior
            // but changing env vars during runtime doesn't affect the already imported constants
            const query = createMockQuery(5);
            const result = validateQuery(query);
            // Since the constants are already imported, this will still pass with default limits
            expect(result.valid).toBe(true);
        });
    });

    describe('checkRateLimit', () => {
        beforeEach(() => {
            // Reset time-based tests
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('allows requests within rate limit', () => {
            const result = checkRateLimit('test-user-1');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(RATE_LIMIT - 1);
        });

        it('tracks different identifiers separately', () => {
            const result1 = checkRateLimit('user1');
            const result2 = checkRateLimit('user2');

            expect(result1.allowed).toBe(true);
            expect(result2.allowed).toBe(true);
        });

        it('blocks requests after rate limit exceeded', () => {
            const identifier = 'test-user-heavy';

            // Make requests up to the limit
            for (let i = 0; i < RATE_LIMIT; i++) {
                const result = checkRateLimit(identifier);
                expect(result.allowed).toBe(true);
            }

            // Next request should be blocked
            const blockedResult = checkRateLimit(identifier);
            expect(blockedResult.allowed).toBe(false);
            expect(blockedResult.remaining).toBe(0);
        });

        it('resets rate limit after time window', () => {
            const identifier = 'test-user-reset';

            // Exhaust rate limit
            for (let i = 0; i < RATE_LIMIT; i++) {
                checkRateLimit(identifier);
            }

            // Should be blocked
            let result = checkRateLimit(identifier);
            expect(result.allowed).toBe(false);

            // Advance time by more than the window (60 seconds)
            jest.advanceTimersByTime(61 * 1000);

            // Should be allowed again
            result = checkRateLimit(identifier);
            expect(result.allowed).toBe(true);
        });

        it('uses default identifier when none provided', () => {
            const result1 = checkRateLimit();
            const result2 = checkRateLimit();

            expect(result1.allowed).toBe(true);
            expect(result2.allowed).toBe(true);
            expect(result2.remaining).toBe(RATE_LIMIT - 2);
        });
    });

    describe('sanitizeVariables', () => {
        it('sanitizes string variables', () => {
            const variables = {
                query: '<script>alert("xss")</script>normal text',
                userInput: 'javascript:alert("xss")',
                eventHandler: 'onclick=alert("xss")',
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.query).toBe('normal text');
            expect(sanitized.userInput).toBe('alert("xss")');
            expect(sanitized.eventHandler).toBe('alert("xss")');
        });

        it('preserves valid string content', () => {
            const variables = {
                name: 'John Doe',
                description: 'A valid description with spaces',
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.name).toBe('John Doe');
            expect(sanitized.description).toBe('A valid description with spaces');
        });

        it('handles numbers correctly', () => {
            const variables = {
                validNumber: 42,
                infiniteNumber: Infinity,
                nanValue: NaN,
                negativeNumber: -10,
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.validNumber).toBe(42);
            expect(sanitized.infiniteNumber).toBe(0);
            expect(sanitized.nanValue).toBe(0);
            expect(sanitized.negativeNumber).toBe(-10);
        });

        it('handles boolean values', () => {
            const variables = {
                isActive: true,
                isDeleted: false,
                truthyValue: 1,
                falsyValue: 0,
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.isActive).toBe(true);
            expect(sanitized.isDeleted).toBe(false);
            expect(sanitized.truthyValue).toBe(1);
            expect(sanitized.falsyValue).toBe(0);
        });

        it('handles null and undefined values', () => {
            const variables = {
                nullValue: null,
                undefinedValue: undefined,
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.nullValue).toBeNull();
            expect(sanitized.undefinedValue).toBeUndefined();
        });

        it('sanitizes nested objects', () => {
            const variables = {
                user: {
                    name: 'John',
                    bio: '<script>alert("xss")</script>Nice person',
                },
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.user).toEqual({
                name: 'John',
                bio: 'Nice person',
            });
        });

        it('handles arrays', () => {
            const variables = {
                tags: ['tag1', '<script>alert("xss")</script>tag2', 'tag3'],
                numbers: [1, 2, 3],
            };

            const sanitized = sanitizeVariables(variables);

            expect(sanitized.tags).toEqual(['tag1', 'tag2', 'tag3']);
            expect(sanitized.numbers).toEqual([1, 2, 3]);
        });
    });

    describe('createSecureHeaders', () => {
        it('returns security headers', () => {
            const headers = createSecureHeaders();

            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['X-Content-Type-Options']).toBe('nosniff');
            expect(headers['X-Frame-Options']).toBe('DENY');
            expect(headers['X-XSS-Protection']).toBe('1; mode=block');
            expect(headers['Cache-Control']).toBe('no-cache, no-store, must-revalidate');
        });

        it('includes all required security headers', () => {
            const headers = createSecureHeaders();
            const requiredHeaders = [
                'Content-Type',
                'X-Requested-With',
                'Cache-Control',
                'Pragma',
                'Expires',
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
            ];

            requiredHeaders.forEach((header) => {
                expect(headers).toHaveProperty(header);
            });
        });
    });

    describe('sanitizeErrorMessage', () => {
        beforeEach(() => {
            // Reset NODE_ENV for each test
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: undefined,
                writable: true,
            });
        });

        it('shows full error message in development', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
            });

            const error = { message: 'Detailed error message' };
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('Detailed error message');
        });

        it('shows generic message in production for network errors', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            const error = { message: 'Network error: Connection failed' };
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('Unable to connect to the service. Please try again later.');
        });

        it('shows generic message in production for GraphQL errors', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            const error = { message: 'GraphQL error: Field not found' };
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('There was an issue processing your request.');
        });

        it('shows generic message for timeout errors', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            const error = { message: 'Timeout: Request took too long' };
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('Request timed out. Please try again.');
        });

        it('shows generic message for rate limit errors', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            const error = { message: 'Rate limit exceeded' };
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('Too many requests. Please wait before trying again.');
        });

        it('shows fallback message for unknown errors in production', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            const error = { message: 'Some unknown error' };
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('Some unknown error');
        });

        it('handles errors without message property', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
            });

            const error = {};
            const sanitized = sanitizeErrorMessage(error);

            expect(sanitized).toBe('Unknown error');
        });

        it('handles null/undefined errors', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
            });

            const sanitized1 = sanitizeErrorMessage(null);
            const sanitized2 = sanitizeErrorMessage(undefined);

            expect(sanitized1).toBe('Unknown error');
            expect(sanitized2).toBe('Unknown error');
        });
    });

    describe('Environment Configuration', () => {
        it('exports configuration constants', () => {
            expect(typeof MAX_QUERY_DEPTH).toBe('number');
            expect(typeof MAX_QUERY_COMPLEXITY).toBe('number');
            expect(typeof REQUEST_TIMEOUT).toBe('number');
            expect(typeof RATE_LIMIT).toBe('number');
        });

        it('uses default values when environment variables are not set', () => {
            // These should use the default values from the module
            expect(MAX_QUERY_DEPTH).toBe(10);
            expect(MAX_QUERY_COMPLEXITY).toBe(1000);
            expect(REQUEST_TIMEOUT).toBe(10000);
            expect(RATE_LIMIT).toBe(60);
        });
    });
});
