'use client';

import React from 'react';
import { Dialog, Button, VStack, HStack, Text, Image, Box, Badge, Grid, GridItem } from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { Character } from '@/lib/graphql/types';

interface CharacterDetailModalProps {
    character: Character | null;
    isOpen: boolean;
    onClose: () => void;
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ character, isOpen, onClose }) => {
    if (!character) return null;

    const getStatusColor = (status: Character['status']) => {
        switch (status) {
            case 'Alive':
                return 'green';
            case 'Dead':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getGenderColor = (gender: Character['gender']) => {
        switch (gender) {
            case 'Male':
                return 'blue';
            case 'Female':
                return 'pink';
            case 'Genderless':
                return 'purple';
            default:
                return 'gray';
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement="center">
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content maxW="4xl" p={0}>
                    <Dialog.Header p={6} pb={0}>
                        <Dialog.Title fontSize="2xl" fontWeight="bold">
                            {character.name}
                        </Dialog.Title>
                    </Dialog.Header>

                    <Dialog.CloseTrigger asChild>
                        <Button variant="ghost" size="sm" position="absolute" top={4} right={4}>
                            <LuX />
                        </Button>
                    </Dialog.CloseTrigger>

                    <Dialog.Body p={6}>
                        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
                            {/* Character Image */}
                            <GridItem>
                                <Image
                                    src={character.image}
                                    alt={character.name}
                                    width="100%"
                                    borderRadius="lg"
                                    objectFit="cover"
                                />
                            </GridItem>

                            {/* Character Details */}
                            <GridItem>
                                <VStack gap={4} align="start">
                                    {/* Status and Species */}
                                    <HStack gap={3} flexWrap="wrap">
                                        <Badge p={2} colorPalette={getStatusColor(character.status)} variant="solid">
                                            {character.status}
                                        </Badge>
                                        <Badge p={2} colorPalette="blue" variant="outline">
                                            {character.species}
                                        </Badge>
                                        <Badge p={2} colorPalette={getGenderColor(character.gender)} variant="subtle">
                                            {character.gender}
                                        </Badge>
                                    </HStack>

                                    {/* Character Type */}
                                    {character.type && (
                                        <Box mb={2}>
                                            <Text mb={1} fontSize="lg" fontWeight="semibold">
                                                Type:
                                            </Text>
                                            <Text fontSize="md">{character.type}</Text>
                                        </Box>
                                    )}

                                    {/* Origin */}
                                    <Box mb={2}>
                                        <Text mb={1} fontSize="lg" fontWeight="semibold">
                                            Origin:
                                        </Text>
                                        <VStack gap={1} align="start">
                                            <Text fontSize="md">{character.origin.name}</Text>
                                            {character.origin.type && character.origin.type !== 'unknown' && (
                                                <Text fontSize="sm">{character.origin.type}</Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Dimension */}
                                    {character.origin.dimension && character.origin.dimension !== 'unknown' && (
                                        <Box mb={2}>
                                            <Text mb={1} fontSize="lg" fontWeight="semibold">
                                                Dimension:
                                            </Text>
                                            <Text fontSize="sm">{character.origin.dimension}</Text>
                                        </Box>
                                    )}

                                    {/* Current Location */}
                                    <Box mb={2}>
                                        <Text mb={1} fontSize="lg" fontWeight="semibold">
                                            Last known location:
                                        </Text>
                                        <VStack gap={1} align="start">
                                            <Text fontSize="md">{character.location.name}</Text>
                                            {character.location.type && character.location.type !== 'unknown' && (
                                                <Text fontSize="sm">{character.location.type}</Text>
                                            )}
                                            {character.location.dimension &&
                                                character.location.dimension !== 'unknown' && (
                                                    <Text fontSize="sm">Dimension: {character.location.dimension}</Text>
                                                )}
                                        </VStack>
                                    </Box>

                                    {/* Episodes */}
                                    <Box mb={2}>
                                        <Text mb={1} fontSize="lg" fontWeight="semibold">
                                            Episodes ({character.episode.length}):
                                        </Text>
                                        <VStack gap={1} align="start">
                                            {character.episode.slice(0, 5).map((episode) => (
                                                <Box key={episode.id} p={2} borderRadius="md" width="100%">
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {episode.episode}: {episode.name}
                                                    </Text>
                                                    <Text fontSize="xs">Air date: {episode.air_date}</Text>
                                                </Box>
                                            ))}
                                            {character.episode.length > 5 && (
                                                <Text fontSize="xs" fontStyle="italic">
                                                    ... and {character.episode.length - 5} more episodes
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Created Date */}
                                    <Box mb={2}>
                                        <Text mb={1} fontSize="lg" fontWeight="semibold">
                                            Created:
                                        </Text>
                                        <Text fontSize="sm">{new Date(character.created).toLocaleDateString()}</Text>
                                    </Box>
                                </VStack>
                            </GridItem>
                        </Grid>
                    </Dialog.Body>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default CharacterDetailModal;
