'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { sanitizeErrorMessage } from '@/lib/security/graphql-security';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Secure Error Boundary Component
 * Catches and handles React errors, including GraphQL errors,
 * while preventing information disclosure in production
 */
class SecureErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by SecureErrorBoundary:', error, errorInfo);
        }

        this.setState({
            error,
            errorInfo,
        });

        // In production, you might want to log to an error reporting service
        // logErrorToService(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default secure error UI
            const sanitizedMessage = this.state.error
                ? sanitizeErrorMessage(this.state.error) || 'An unexpected error occurred'
                : 'An unexpected error occurred';

            return (
                <Box p={6} maxW="md" mx="auto" mt={8}>
                    <Box
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.200"
                        borderRadius="md"
                        p={6}
                        textAlign="center"
                    >
                        <Text fontSize="lg" fontWeight="bold" color="red.600" mb={2}>
                            Something went wrong
                        </Text>
                        <Text color="red.500" mb={4}>
                            {sanitizedMessage}
                        </Text>
                        <Button colorScheme="red" size="sm" onClick={this.handleRetry}>
                            Try Again
                        </Button>
                    </Box>

                    {/* Development-only error details */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <Box mt={4} p={4} bg="gray.100" borderRadius="md">
                            <Text fontSize="sm" fontWeight="bold" mb={2}>
                                Development Error Details:
                            </Text>
                            <Text fontSize="xs" fontFamily="mono" color="red.600">
                                {this.state.error.toString()}
                            </Text>
                            {this.state.errorInfo && (
                                <Text fontSize="xs" fontFamily="mono" color="gray.600" mt={2}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            )}
                        </Box>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}

export default SecureErrorBoundary;
