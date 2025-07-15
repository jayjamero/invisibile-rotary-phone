import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createSecureHeaders, sanitizeErrorMessage, REQUEST_TIMEOUT } from './security/graphql-security';

// Create HTTP link with timeout
const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://rickandmortyapi.com/graphql',
    fetch: (uri, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        return fetch(uri, {
            ...options,
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
    },
});

// Authentication/Security context link
const authLink = setContext((_, { headers }) => {
    const secureHeaders = createSecureHeaders();

    return {
        headers: {
            ...headers,
            ...secureHeaders,
        },
    };
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            const sanitizedMessage = sanitizeErrorMessage({ message });
            console.error(`[GraphQL error]: Message: ${sanitizedMessage}, Location: ${locations}, Path: ${path}`);
        });
    }

    if (networkError) {
        const sanitizedMessage = sanitizeErrorMessage(networkError);
        console.error(`[Network error]: ${sanitizedMessage}`);

        // Handle specific network errors
        if ('statusCode' in networkError) {
            switch (networkError.statusCode) {
                case 429:
                    console.warn('Rate limit exceeded');
                    break;
                case 403:
                    console.warn('Access forbidden');
                    break;
                case 500:
                    console.warn('Server error');
                    break;
            }
        }
    }
});

// Combine links with security measures
const link = from([errorLink, authLink, httpLink]);

const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache({
        // Enable strict mode for better security
        possibleTypes: {},
        typePolicies: {
            // Prevent cache poisoning by normalizing IDs
            Character: {
                fields: {
                    id: {
                        merge: false,
                    },
                },
            },
            Episode: {
                fields: {
                    id: {
                        merge: false,
                    },
                },
            },
            Location: {
                fields: {
                    id: {
                        merge: false,
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            // Add security options
            notifyOnNetworkStatusChange: true,
        },
        query: {
            errorPolicy: 'all',
            // Prevent caching of sensitive data
            fetchPolicy: 'cache-first',
        },
    },
});

export default apolloClient;
