'use client';

import { useQuery } from '@apollo/client';
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

// Hook to get multiple characters
export const useCharacters = (page?: number, filter?: FilterCharacter) => {
    return useQuery<CharactersResponse>(GET_CHARACTERS, {
        variables: { page, filter },
        errorPolicy: 'all',
        skip: page === undefined, // Skip query when page is undefined
    });
};

// Hook to get a single character
export const useCharacter = (id: string) => {
    return useQuery<CharacterResponse>(GET_CHARACTER, {
        variables: { id },
        errorPolicy: 'all',
        skip: !id,
    });
};

// Hook to get episodes
export const useEpisodes = (page?: number, filter?: FilterEpisode) => {
    return useQuery<EpisodesResponse>(GET_EPISODES, {
        variables: { page, filter },
        errorPolicy: 'all',
    });
};

// Hook to get locations
export const useLocations = (page?: number, filter?: FilterLocation) => {
    return useQuery<LocationsResponse>(GET_LOCATIONS, {
        variables: { page, filter },
        errorPolicy: 'all',
    });
};

// Hook to get random characters for dummy data
export const useRandomCharacters = () => {
    const randomIds = ['1', '2', '3', '4', '5']; // Rick, Morty, Summer, Beth, Jerry
    return useQuery<CharactersResponse>(GET_CHARACTERS, {
        variables: {
            filter: {
                name: randomIds.map(() => `Rick,Morty,Summer,Beth,Jerry`).join(','),
            },
        },
        errorPolicy: 'all',
    });
};
