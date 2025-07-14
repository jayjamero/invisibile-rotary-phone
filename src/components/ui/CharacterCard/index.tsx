'use client';

import React from 'react';
import { Box, VStack, Text, HStack, Card, Image } from '@chakra-ui/react';
import { Character } from '@/lib/graphql/types';

interface CharacterCardProps {
    character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
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

    return (
        <Card.Root overflow="hidden">
            <Image src={character.image} alt={character.name} width="100%" height="300px" objectFit="cover" />
            <Card.Body p={4}>
                <VStack gap={2} align="start">
                    <Text fontSize="lg" fontWeight="bold">
                        {character.name}
                    </Text>
                    <HStack>
                        <Box width="10px" height="10px" borderRadius="50%" bg={getStatusColor(character.status)} />
                        <Text fontSize="sm" color="gray.600">
                            {character.status} - {character.species}
                        </Text>
                    </HStack>
                    <Box>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            Last known location:
                        </Text>
                        <Text fontSize="sm">{character.location.name}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            First seen in:
                        </Text>
                        <Text fontSize="sm">{character.episode[0]?.name || 'Unknown'}</Text>
                    </Box>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};

export default CharacterCard;
