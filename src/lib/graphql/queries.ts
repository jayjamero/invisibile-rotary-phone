import { gql } from '@apollo/client';

// Fragment for Character info
export const CHARACTER_FRAGMENT = gql`
    fragment CharacterInfo on Character {
        id
        name
        status
        species
        type
        gender
        origin {
            id
            name
            type
            dimension
        }
        location {
            id
            name
            type
            dimension
            created
        }
        image
        episode {
            id
            name
            air_date
            episode
            created
        }
        created
    }
`;

// Fragment for Episode info
export const EPISODE_FRAGMENT = gql`
    fragment EpisodeInfo on Episode {
        id
        name
        air_date
        episode
        created
    }
`;

// Fragment for Location info
export const LOCATION_FRAGMENT = gql`
    fragment LocationInfo on Location {
        id
        name
        type
        dimension
        created
    }
`;

// Fragment for Info pagination
export const INFO_FRAGMENT = gql`
    fragment InfoData on Info {
        count
        pages
        next
        prev
    }
`;

// Query to get multiple characters
export const GET_CHARACTERS = gql`
    ${CHARACTER_FRAGMENT}
    ${INFO_FRAGMENT}
    query GetCharacters($page: Int, $filter: FilterCharacter) {
        characters(page: $page, filter: $filter) {
            info {
                ...InfoData
            }
            results {
                ...CharacterInfo
            }
        }
    }
`;

// Query to get a single character
export const GET_CHARACTER = gql`
    ${CHARACTER_FRAGMENT}
    query GetCharacter($id: ID!) {
        character(id: $id) {
            ...CharacterInfo
        }
    }
`;

// Query to get episodes
export const GET_EPISODES = gql`
    ${EPISODE_FRAGMENT}
    ${INFO_FRAGMENT}
    query GetEpisodes($page: Int, $filter: FilterEpisode) {
        episodes(page: $page, filter: $filter) {
            info {
                ...InfoData
            }
            results {
                ...EpisodeInfo
            }
        }
    }
`;

// Query to get locations
export const GET_LOCATIONS = gql`
    ${LOCATION_FRAGMENT}
    ${INFO_FRAGMENT}
    query GetLocations($page: Int, $filter: FilterLocation) {
        locations(page: $page, filter: $filter) {
            info {
                ...InfoData
            }
            results {
                ...LocationInfo
            }
        }
    }
`;

// Query to get multiple characters by IDs
export const GET_CHARACTERS_BY_IDS = gql`
    ${CHARACTER_FRAGMENT}
    query GetCharactersByIds($ids: [ID!]!) {
        charactersByIds(ids: $ids) {
            ...CharacterInfo
        }
    }
`;
