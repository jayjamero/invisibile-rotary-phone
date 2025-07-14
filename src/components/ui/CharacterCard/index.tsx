'use client';

import React from 'react';
import { Box, VStack, Text, HStack, Card, Image } from '@chakra-ui/react';
import { Character } from '@/lib/graphql/types';

interface CharacterCardProps {
    character: Character;
    onClick?: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick }) => {
    const getStatusColor = (status: Character['status']) => {
        switch (status) {
            case 'Alive':
                return 'green.500';
            case 'Dead':
                return 'red.500';
            default:
                return 'gray.500';
        }
    };

    const cardTitle = `${character.name} - ${character.status} ${character.species}`;

    return (
        <Card.Root
            overflow="hidden"
            cursor={onClick ? 'pointer' : 'default'}
            onClick={onClick}
            _hover={onClick ? { transform: 'translateY(-2px)', shadow: 'lg' } : {}}
            transition="all 0.2s"
            role={onClick ? 'button' : 'article'}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? `View details for ${cardTitle}` : cardTitle}
            aria-describedby={`character-${character.id}-description`}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onClick();
                          }
                      }
                    : undefined
            }
            _focus={{
                outline: '2px solid',
                outlineColor: 'blue.500',
                outlineOffset: '2px',
            }}
        >
            <Image
                src={character.image}
                alt={`Portrait of ${character.name}, a ${character.status.toLowerCase()} ${character.species.toLowerCase()}`}
                width="100%"
                height="300px"
                objectFit="cover"
                loading="lazy"
            />
            <Card.Body p={4}>
                <VStack gap={2} align="start" id={`character-${character.id}-description`}>
                    <Text fontSize="lg" fontWeight="bold" as="h3" aria-label={`Character name: ${character.name}`}>
                        {character.name}
                    </Text>
                    <HStack role="group" aria-label={`Status and species: ${character.status} ${character.species}`}>
                        <Box
                            width="10px"
                            height="10px"
                            borderRadius="50%"
                            bg={getStatusColor(character.status)}
                            aria-hidden="true"
                        />
                        <Text fontSize="sm" color="gray.600">
                            {character.status} - {character.species}
                        </Text>
                    </HStack>
                    <Box role="group" aria-labelledby={`location-${character.id}`}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium" id={`location-${character.id}`}>
                            Last known location:
                        </Text>
                        <Text fontSize="sm" aria-describedby={`location-${character.id}`}>
                            {character.location.name}
                        </Text>
                    </Box>
                    <Box role="group" aria-labelledby={`episode-${character.id}`}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium" id={`episode-${character.id}`}>
                            First seen in:
                        </Text>
                        <Text fontSize="sm" aria-describedby={`episode-${character.id}`}>
                            {character.episode[0]?.name || 'Unknown'}
                        </Text>
                    </Box>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};

export default CharacterCard;
