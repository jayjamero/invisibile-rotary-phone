/**
 * @jest-environment jsdom
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import { useSecureQuery, useSecureLazyQuery, useSecureMutation, useGraphQLAuditLogger } from '../secure-apollo-hooks';

// Mock the secure-query-utils module
jest.mock('../secure-query-utils', () => ({
    maskGraphQLResponse: jest.fn((data) => ({ ...data, masked: true })),
    logSecureGraphQLOperation: jest.fn(),
    isQuerySafe: jest.fn(() => true),
    handleGraphQLError: jest.fn((error) => error.message),
    createAuditSafeData: jest.fn((data) => ({ ...data, audited: true })),
}));

// Import mocked functions
import {
    logSecureGraphQLOperation,
    isQuerySafe,
    createAuditSafeData,
} from '../secure-query-utils';

const mockLogSecureGraphQLOperation = logSecureGraphQLOperation as jest.MockedFunction<
    typeof logSecureGraphQLOperation
>;
const mockIsQuerySafe = isQuerySafe as jest.MockedFunction<typeof isQuerySafe>;
const mockCreateAuditSafeData = createAuditSafeData as jest.MockedFunction<typeof createAuditSafeData>;

// Test queries and mutations
const TEST_QUERY = gql`
    query GetCharacter($id: ID!) {
        character(id: $id) {
            id
            name
        }
    }
`;

const TEST_MUTATION = gql`
    mutation CreateCharacter($input: CharacterInput!) {
        createCharacter(input: $input) {
            id
            name
        }
    }
`;

// Mock setup function
const createMockProvider = (mocks: MockedResponse[] = []) => {
    const MockProvider = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks={mocks} addTypename={false}>
            {children}
        </MockedProvider>
    );
    MockProvider.displayName = 'MockProvider';
    return MockProvider;
};

describe('secure-apollo-hooks (simplified)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsQuerySafe.mockReturnValue(true);
    });

    describe('useSecureQuery', () => {
        it('should initialize and call validation', () => {
            const wrapper = createMockProvider();

            const { result } = renderHook(() => useSecureQuery(TEST_QUERY, { variables: { id: '1' }, skip: true }), {
                wrapper,
            });

            expect(result.current.isQueryValid).toBe(true);
            expect(mockIsQuerySafe).toHaveBeenCalledWith(TEST_QUERY, false);
        });

        it('should block unsafe queries', () => {
            mockIsQuerySafe.mockReturnValue(false);
            const wrapper = createMockProvider();

            const { result } = renderHook(() => useSecureQuery(TEST_QUERY, { variables: { id: '1' }, skip: true }), {
                wrapper,
            });

            expect(result.current.isQueryValid).toBe(false);
        });
    });

    describe('useSecureLazyQuery', () => {
        it('should initialize correctly and provide execute function', () => {
            const wrapper = createMockProvider();

            const { result } = renderHook(() => useSecureLazyQuery(TEST_QUERY), { wrapper });

            expect(Array.isArray(result.current)).toBe(true);
            expect(typeof result.current[0]).toBe('function');
            expect(typeof result.current[1]).toBe('object');
        });

        it('should validate query when executing', () => {
            const wrapper = createMockProvider();

            const { result } = renderHook(() => useSecureLazyQuery(TEST_QUERY), { wrapper });

            const [execute] = result.current;

            // Call the execute function - this should trigger validation
            act(() => {
                execute({ variables: { id: '1' } });
            });

            expect(mockIsQuerySafe).toHaveBeenCalledWith(TEST_QUERY, false);
        });
    });

    describe('useSecureMutation', () => {
        it('should initialize correctly and provide execute function', () => {
            const wrapper = createMockProvider();

            const { result } = renderHook(() => useSecureMutation(TEST_MUTATION), { wrapper });

            expect(Array.isArray(result.current)).toBe(true);
            expect(typeof result.current[0]).toBe('function');
            expect(typeof result.current[1]).toBe('object');
        });

        it('should validate mutation when executing', () => {
            const wrapper = createMockProvider();

            const { result } = renderHook(() => useSecureMutation(TEST_MUTATION), { wrapper });

            const [execute] = result.current;

            // Call the execute function - this should trigger validation
            act(() => {
                execute({ variables: { input: { name: 'Test' } } });
            });

            expect(mockIsQuerySafe).toHaveBeenCalledWith(TEST_MUTATION, false);
        });
    });

    describe('useGraphQLAuditLogger', () => {
        it('should provide logOperation function', () => {
            const { result } = renderHook(() => useGraphQLAuditLogger());

            expect(typeof result.current.logOperation).toBe('function');
            expect(typeof result.current.createAuditLog).toBe('function');
        });

        it('should log operations correctly', () => {
            const { result } = renderHook(() => useGraphQLAuditLogger());

            const testData = { test: 'data' };
            const testError = { message: 'test error' };

            result.current.logOperation('TEST_OPERATION', TEST_QUERY, { id: '1' }, testData, testError);

            expect(mockLogSecureGraphQLOperation).toHaveBeenCalledWith(
                'TEST_OPERATION',
                TEST_QUERY,
                { id: '1' },
                testData,
                testError
            );
        });

        it('should create audit logs correctly', () => {
            const { result } = renderHook(() => useGraphQLAuditLogger());

            const testData = { sensitive: 'data', public: 'info' };

            const auditLog = result.current.createAuditLog(testData);

            expect(mockCreateAuditSafeData).toHaveBeenCalledWith(testData);
            expect(auditLog).toEqual({ ...testData, audited: true });
        });
    });

    describe('interface exports', () => {
        it('should export all required hooks', () => {
            expect(useSecureQuery).toBeDefined();
            expect(useSecureLazyQuery).toBeDefined();
            expect(useSecureMutation).toBeDefined();
            expect(useGraphQLAuditLogger).toBeDefined();
        });
    });

    describe('configuration', () => {
        it('should handle enableDataMasking configuration', () => {
            const wrapper = createMockProvider();

            renderHook(
                () =>
                    useSecureQuery(TEST_QUERY, {
                        variables: { id: '1' },
                        skip: true,
                        enableDataMasking: false,
                    }),
                { wrapper }
            );

            // Hook should initialize without error
            expect(mockIsQuerySafe).toHaveBeenCalled();
        });

        it('should handle enableAuditLogging configuration', () => {
            const wrapper = createMockProvider();

            renderHook(
                () =>
                    useSecureQuery(TEST_QUERY, {
                        variables: { id: '1' },
                        skip: true,
                        enableAuditLogging: true,
                    }),
                { wrapper }
            );

            // Hook should initialize without error
            expect(mockIsQuerySafe).toHaveBeenCalled();
        });
    });
});
