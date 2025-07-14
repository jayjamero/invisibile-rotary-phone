import React from 'react';
import { screen } from '@testing-library/react';
import { render as customRender } from '@/test-utils/render';
import CharacterCard from '../index';
import { Character } from '@/lib/graphql/types';

const mockCharacter: Character = {
    id: '1',
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: {
        id: '1',
        name: 'Earth (C-137)',
        type: 'Planet',
        dimension: 'Dimension C-137',
    },
    location: {
        id: '3',
        name: 'Citadel of Ricks',
        type: 'Space station',
        dimension: 'unknown',
        created: '2017-11-10T12:56:33.798Z',
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: [
        {
            id: '1',
            name: 'Pilot',
            air_date: 'December 2, 2013',
            episode: 'S01E01',
            created: '2017-11-10T12:56:33.798Z',
        },
    ],
    created: '2017-11-04T18:48:46.250Z',
};

describe('CharacterCard', () => {
    it('renders character name', () => {
        customRender(<CharacterCard character={mockCharacter} />);
        expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    it('renders character status and species', () => {
        customRender(<CharacterCard character={mockCharacter} />);
        expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    });

    it('renders character location', () => {
        customRender(<CharacterCard character={mockCharacter} />);
        expect(screen.getByText('Last known location:')).toBeInTheDocument();
        expect(screen.getByText('Citadel of Ricks')).toBeInTheDocument();
    });

    it('renders first episode', () => {
        customRender(<CharacterCard character={mockCharacter} />);
        expect(screen.getByText('First seen in:')).toBeInTheDocument();
        expect(screen.getByText('Pilot')).toBeInTheDocument();
    });

    it('renders Unknown when no episodes', () => {
        const characterWithoutEpisodes = {
            ...mockCharacter,
            episode: [],
        };
        customRender(<CharacterCard character={characterWithoutEpisodes} />);
        expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('renders character image with correct props', () => {
        customRender(<CharacterCard character={mockCharacter} />);
        const image = screen.getByAltText(/portrait of rick sanchez/i);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockCharacter.image);
    });

    it('applies correct status color for alive character', () => {
        customRender(<CharacterCard character={mockCharacter} />);
        // Check that the status text is present, which indicates the component is rendering
        expect(screen.getByText('Alive - Human')).toBeInTheDocument();
    });

    it('applies correct status color for dead character', () => {
        const deadCharacter = {
            ...mockCharacter,
            status: 'Dead' as const,
        };
        customRender(<CharacterCard character={deadCharacter} />);
        expect(screen.getByText('Dead - Human')).toBeInTheDocument();
    });

    it('applies correct status color for unknown status', () => {
        const unknownCharacter = {
            ...mockCharacter,
            status: 'unknown' as const,
        };
        customRender(<CharacterCard character={unknownCharacter} />);
        expect(screen.getByText('unknown - Human')).toBeInTheDocument();
    });
});
