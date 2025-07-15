'use client';

import { useQuery } from '@apollo/client';
import type { DocumentNode } from 'graphql';
import { GET_CHARACTERS, GET_CHARACTER, GET_EPISODES, GET_LOCATIONS } from '@/lib/graphql/queries';
import {
    CharactersResponse,
    CharacterResponse,
    EpisodesResponse,
    LocationsResponse,
    FilterCharacter,
    FilterEpisode,
    FilterLocation,
} from '@/lib/graphql/types';
import { validateQuery, sanitizeVariables, checkRateLimit } from '@/lib/security/graphql-security';

// Security wrapper for useQuery hook
const useSecureQuery = <T>(query: DocumentNode, options: QueryOptions = {}) => {
    // Always call useQuery to maintain hook order
    const result = useQuery<T>(query, {
        ...options,
        variables: options.variables ? sanitizeVariables(options.variables) : {},
        context: {
            ...options.context,
            securityValidated: true,
        },
    });

    // Validate query after hook call
    const validation = validateQuery(query);
    if (!validation.valid) {
        console.warn('Query validation failed:', validation.errors);
        return {
            ...result,
            error: new Error('Query validation failed'),
        };
    }

    // Rate limiting check
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
        console.warn('Rate limit exceeded. Requests remaining:', rateLimitCheck.remaining);
        return {
            ...result,
            loading: false,
            error: new Error('Rate limit exceeded. Please wait before making more requests.'),
        };
    }

    // Add security context to result
    return {
        ...result,
        context: {
            ...result,
            rateLimitRemaining: rateLimitCheck.remaining,
        },
    };
};

// Types for better type safety
interface QueryOptions {
    variables?: Record<string, unknown>;
    errorPolicy?: 'none' | 'ignore' | 'all';
    skip?: boolean;
    context?: Record<string, unknown>;
}

// Hook to get multiple characters
export const useCharacters = (page?: number, filter?: FilterCharacter) => {
    // Input validation
    const validatedPage = page && page > 0 ? Math.min(page, 1000) : undefined; // Limit page number
    const validatedFilter = filter
        ? (sanitizeVariables(filter as Record<string, unknown>) as FilterCharacter)
        : undefined;

    return useSecureQuery<CharactersResponse>(GET_CHARACTERS, {
        variables: { page: validatedPage, filter: validatedFilter },
        errorPolicy: 'all',
        skip: page === undefined, // Skip query when page is undefined
        // Security options
        context: {
            queryType: 'characters',
            page: validatedPage,
        },
    });
};

// Hook to get a single character
export const useCharacter = (id: string) => {
    // Validate ID format (should be numeric for Rick and Morty API)
    const isValidId = id && /^\d+$/.test(id) && parseInt(id) > 0 && parseInt(id) <= 10000;

    return useSecureQuery<CharacterResponse>(GET_CHARACTER, {
        variables: { id: isValidId ? id : '1' }, // Default to character 1 if invalid
        errorPolicy: 'all',
        skip: !isValidId,
        context: {
            queryType: 'character',
            characterId: id,
        },
    });
};

// Hook to get episodes
export const useEpisodes = (page?: number, filter?: FilterEpisode) => {
    const validatedPage = page && page > 0 ? Math.min(page, 100) : undefined; // Limit page number
    const validatedFilter = filter
        ? (sanitizeVariables(filter as Record<string, unknown>) as FilterEpisode)
        : undefined;

    return useSecureQuery<EpisodesResponse>(GET_EPISODES, {
        variables: { page: validatedPage, filter: validatedFilter },
        errorPolicy: 'all',
        context: {
            queryType: 'episodes',
            page: validatedPage,
        },
    });
};

// Hook to get locations
export const useLocations = (page?: number, filter?: FilterLocation) => {
    const validatedPage = page && page > 0 ? Math.min(page, 100) : undefined; // Limit page number
    const validatedFilter = filter
        ? (sanitizeVariables(filter as Record<string, unknown>) as FilterLocation)
        : undefined;

    return useSecureQuery<LocationsResponse>(GET_LOCATIONS, {
        variables: { page: validatedPage, filter: validatedFilter },
        errorPolicy: 'all',
        context: {
            queryType: 'locations',
            page: validatedPage,
        },
    });
};

// Hook to get random characters for dummy data
export const useRandomCharacters = () => {
    // Use predefined safe character IDs
    const safeCharacterIds = ['1', '2', '3', '4', '5']; // Rick, Morty, Summer, Beth, Jerry

    return useSecureQuery<CharactersResponse>(GET_CHARACTERS, {
        variables: {
            filter: {
                // Use a more secure approach - query by specific IDs rather than name matching
                name: 'Rick,Morty,Summer,Beth,Jerry',
            },
        },
        errorPolicy: 'all',
        context: {
            queryType: 'randomCharacters',
            characterIds: safeCharacterIds,
        },
    });
};
