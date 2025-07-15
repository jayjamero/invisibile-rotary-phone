import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../../test-utils/render';
import SecureErrorBoundary from '../index';

// Mock the sanitizeErrorMessage function
jest.mock('@/lib/security/graphql-security', () => ({
    sanitizeErrorMessage: jest.fn(),
}));

import { sanitizeErrorMessage } from '@/lib/security/graphql-security';
const mockSanitizeErrorMessage = sanitizeErrorMessage as jest.MockedFunction<typeof sanitizeErrorMessage>;

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error message');
    }
    return <div>No error</div>;
};

// Custom fallback component for testing
const CustomFallback = () => <div data-testid="custom-fallback">Custom error fallback</div>;

describe('SecureErrorBoundary', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;

    // Mock console.error to avoid test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        consoleSpy.mockClear();
        mockSanitizeErrorMessage.mockClear();

        // Set default mock behavior
        mockSanitizeErrorMessage.mockImplementation((error) => {
            if (process.env.NODE_ENV === 'development') {
                return error?.message || 'An unknown error occurred';
            }
            return 'An error occurred while processing your request.';
        });
    });

    afterEach(() => {
        // Reset NODE_ENV after each test
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalNodeEnv,
            writable: true,
        });
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    describe('when no error occurs', () => {
        it('renders children normally', () => {
            render(
                <SecureErrorBoundary>
                    <div data-testid="child-component">Child content</div>
                </SecureErrorBoundary>
            );

            expect(screen.getByTestId('child-component')).toBeInTheDocument();
            expect(screen.getByText('Child content')).toBeInTheDocument();
        });
    });

    describe('when an error occurs', () => {
        it('catches the error and renders default error UI', () => {
            mockSanitizeErrorMessage.mockReturnValue('Test error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
            expect(screen.getByText('Try Again')).toBeInTheDocument();
            expect(screen.getByText('Test error message')).toBeInTheDocument();
            expect(screen.queryByText('No error')).not.toBeInTheDocument();
        });

        it('renders custom fallback when provided', () => {
            render(
                <SecureErrorBoundary fallback={<CustomFallback />}>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
            expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
            expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
        });

        it('displays sanitized error message', () => {
            mockSanitizeErrorMessage.mockReturnValue('Sanitized error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(screen.getByText('Sanitized error message')).toBeInTheDocument();
            expect(mockSanitizeErrorMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Test error message' })
            );
        });

        it('displays fallback message when no error provided', () => {
            // Mock sanitizeErrorMessage to return fallback message
            mockSanitizeErrorMessage.mockReturnValue('An unexpected error occurred');

            // Create a component that throws without a message
            const ThrowUndefinedError = () => {
                const error = new Error();
                error.message = '';
                throw error;
            };

            render(
                <SecureErrorBoundary>
                    <ThrowUndefinedError />
                </SecureErrorBoundary>
            );

            expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
        });
    });

    describe('retry functionality', () => {
        it('resets error state when Try Again is clicked', () => {
            mockSanitizeErrorMessage.mockReturnValue('Test error message');

            const { rerender } = render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            // Error UI should be visible
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();

            // Click Try Again button
            fireEvent.click(screen.getByText('Try Again'));

            // Re-render with no error
            rerender(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={false} />
                </SecureErrorBoundary>
            );

            // Should show normal content
            expect(screen.getByText('No error')).toBeInTheDocument();
            expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
        });
    });

    describe('development vs production behavior', () => {
        beforeEach(() => {
            consoleSpy.mockClear();
        });

        it('logs error details in development mode', () => {
            // Set NODE_ENV to development
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
            });

            mockSanitizeErrorMessage.mockReturnValue('Development error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error caught by SecureErrorBoundary:',
                expect.objectContaining({ message: 'Test error message' }),
                expect.any(Object)
            );
        });

        it('shows development error details in development mode', () => {
            // Set NODE_ENV to development
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
            });

            mockSanitizeErrorMessage.mockReturnValue('Development error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(screen.getByText('Development Error Details:')).toBeInTheDocument();
            expect(screen.getByText(/Error: Test error message/)).toBeInTheDocument();
        });

        it('does not log error details in production mode', () => {
            // Set NODE_ENV to production
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            mockSanitizeErrorMessage.mockReturnValue('Production error message');

            // Clear console spy before test
            consoleSpy.mockClear();

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            // Check that our component's console.error was not called
            // Note: React may still log errors, but our component should not
            const componentErrorCalls = consoleSpy.mock.calls.filter(
                (call) => call[0] === 'Error caught by SecureErrorBoundary:'
            );
            expect(componentErrorCalls).toHaveLength(0);
        });

        it('hides development error details in production mode', () => {
            // Set NODE_ENV to production
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                writable: true,
            });

            mockSanitizeErrorMessage.mockReturnValue('Production error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(screen.queryByText('Development Error Details:')).not.toBeInTheDocument();
            expect(screen.queryByText(/Error: Test error message/)).not.toBeInTheDocument();
        });
    });

    describe('error boundary lifecycle', () => {
        it('calls getDerivedStateFromError when error occurs', () => {
            const spy = jest.spyOn(SecureErrorBoundary, 'getDerivedStateFromError');
            mockSanitizeErrorMessage.mockReturnValue('Test error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(spy).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test error message' }));

            spy.mockRestore();
        });

        it('updates state correctly in getDerivedStateFromError', () => {
            const error = new Error('Test error');
            const result = SecureErrorBoundary.getDerivedStateFromError(error);

            expect(result).toEqual({
                hasError: true,
                error: error,
            });
        });
    });

    describe('accessibility', () => {
        it('renders error UI with proper semantic elements', () => {
            mockSanitizeErrorMessage.mockReturnValue('Test error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            // Check for proper heading structure
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();

            // Check for actionable button
            const retryButton = screen.getByRole('button', { name: 'Try Again' });
            expect(retryButton).toBeInTheDocument();
            expect(retryButton).toBeEnabled();
        });

        it('maintains focus management on retry', () => {
            mockSanitizeErrorMessage.mockReturnValue('Test error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            const retryButton = screen.getByRole('button', { name: 'Try Again' });

            // Focus the button and click it
            retryButton.focus();
            expect(document.activeElement).toBe(retryButton);

            fireEvent.click(retryButton);

            // After retry, focus should be maintained appropriately
            // Note: In a real scenario, you might want to focus the first interactive element
        });
    });

    describe('integration with security utilities', () => {
        it('integrates with sanitizeErrorMessage function', () => {
            mockSanitizeErrorMessage.mockReturnValue('Generic error message');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(mockSanitizeErrorMessage).toHaveBeenCalled();
            expect(screen.getByText('Generic error message')).toBeInTheDocument();
        });

        it('handles undefined errors gracefully', () => {
            mockSanitizeErrorMessage.mockImplementation(() => 'An unexpected error occurred');

            // Test case where setState is called with undefined error
            // Simulate getDerivedStateFromError with undefined
            const result = SecureErrorBoundary.getDerivedStateFromError(undefined as unknown as Error);
            expect(result.hasError).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe('error message handling', () => {
        it('handles different error types', () => {
            mockSanitizeErrorMessage.mockReturnValue('Handled error');

            // Test with string error
            const ThrowStringError = () => {
                throw 'String error';
            };

            render(
                <SecureErrorBoundary>
                    <ThrowStringError />
                </SecureErrorBoundary>
            );

            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        });

        it('falls back to default message when sanitizer returns empty', () => {
            mockSanitizeErrorMessage.mockReturnValue('');

            render(
                <SecureErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </SecureErrorBoundary>
            );

            expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
        });
    });
});
