// GraphQL Types for Rick and Morty API

export interface Info {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
}

export interface Origin {
    id: string;
    name: string;
    type: string;
    dimension: string;
}

export interface Location {
    id: string;
    name: string;
    type: string;
    dimension: string;
    created: string;
}

export interface Episode {
    id: string;
    name: string;
    air_date: string;
    episode: string;
    created: string;
}

export interface Character {
    id: string;
    name: string;
    status: 'Alive' | 'Dead' | 'unknown';
    species: string;
    type: string;
    gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
    origin: Origin;
    location: Location;
    image: string;
    episode: Episode[];
    created: string;
}

export interface CharactersData {
    results: Character[];
    info: Info;
}

export interface CharactersResponse {
    characters: CharactersData;
}

export interface CharacterResponse {
    character: Character;
}

export interface EpisodesData {
    results: Episode[];
    info: Info;
}

export interface EpisodesResponse {
    episodes: EpisodesData;
}

export interface LocationsData {
    results: Location[];
    info: Info;
}

export interface LocationsResponse {
    locations: LocationsData;
}

// Filter types
export interface FilterCharacter {
    name?: string;
    status?: string;
    species?: string;
    type?: string;
    gender?: string;
}

export interface FilterEpisode {
    name?: string;
    episode?: string;
}

export interface FilterLocation {
    name?: string;
    type?: string;
    dimension?: string;
}
